const asyncHandler = require('express-async-handler');
const { cloudinary } = require('../config/cloudinary');
const Furniture = require('../models/Furniture');
const RecentlyViewed = require('../models/RecentlyViewed');
const { ApiError, success } = require('../utils/apiResponse');

/**
 * @desc    List furniture with search, filters, sorting, pagination
 * @route   GET /api/furniture
 * @access  Public
 * Query params: q, category, itemType, colors, materials,
 *               roomType, trending, featured, sort, page, limit
 */
const getFurniture = asyncHandler(async (req, res) => {
  const {
    q,
    category,
    itemType,
    colors,
    materials,
    roomType,
    trending,
    featured,
    sort = '-createdAt',
    page = 1,
    limit = 20,
  } = req.query;

  const filter = { isAvailable: true };

  if (q) filter.$text = { $search: q };
  if (category) filter.category = category;
  if (itemType) filter.itemType = itemType;
  if (roomType) filter.roomTypes = roomType;
  if (trending === 'true') filter.isTrending = true;
  if (featured === 'true') filter.isFeatured = true;
  if (colors) filter['colors.name'] = { $in: colors.split(',') };
  if (materials) filter.materials = { $in: materials.split(',') };

  const pageNum = Math.max(Number(page), 1);
  const limitNum = Math.min(Math.max(Number(limit), 1), 100);
  const skip = (pageNum - 1) * limitNum;

  const [items, total] = await Promise.all([
    Furniture.find(filter).populate('category', 'name slug').sort(sort).skip(skip).limit(limitNum),
    Furniture.countDocuments(filter),
  ]);

  return success(res, 200, 'Furniture fetched', items, {
    page: pageNum,
    limit: limitNum,
    total,
    totalPages: Math.ceil(total / limitNum),
  });
});

/**
 * @desc    Get single furniture item by ID, tracks recently-viewed if authenticated
 * @route   GET /api/furniture/:id
 * @access  Public
 */
const getFurnitureById = asyncHandler(async (req, res) => {
  const item = await Furniture.findById(req.params.id).populate('category', 'name slug');
  if (!item) throw new ApiError(404, 'Furniture item not found');

  item.viewCount += 1;
  await item.save();

  if (req.user) {
    await RecentlyViewed.findOneAndUpdate(
      { user: req.user._id, furniture: item._id },
      { viewedAt: new Date() },
      { upsert: true, new: true }
    );
  }

  return success(res, 200, 'Furniture fetched', item);
});

/**
 * @desc    Create a furniture item (with images + optional 3D model)
 * @route   POST /api/furniture
 * @access  Private/Admin
 */
const createFurniture = asyncHandler(async (req, res) => {
  const payload = { ...req.body, createdBy: req.user._id };

  if (typeof payload.dimensions === 'string') payload.dimensions = JSON.parse(payload.dimensions);
  if (typeof payload.colors === 'string') payload.colors = JSON.parse(payload.colors);
  if (typeof payload.materials === 'string') payload.materials = JSON.parse(payload.materials);
  if (typeof payload.roomTypes === 'string') payload.roomTypes = JSON.parse(payload.roomTypes);
  if (typeof payload.specifications === 'string') payload.specifications = JSON.parse(payload.specifications);

  if (req.files && req.files.length > 0) {
    payload.images = req.files.map((f) => ({ url: f.path, publicId: f.filename }));
  }

  const item = await Furniture.create(payload);
  return success(res, 201, 'Furniture created', item);
});

/**
 * @desc    Update a furniture item
 * @route   PUT /api/furniture/:id
 * @access  Private/Admin
 */
const updateFurniture = asyncHandler(async (req, res) => {
  const item = await Furniture.findById(req.params.id);
  if (!item) throw new ApiError(404, 'Furniture item not found');

  const updatable = [
    'name', 'description', 'category', 'itemType', 'dimensions',
    'materials', 'colors', 'roomTypes', 'specifications', 'voltage', 'powerConsumptionWatts',
    'energyRating', 'stock', 'isAvailable', 'isFeatured', 'isTrending', 'sku',
  ];
  updatable.forEach((field) => {
    if (req.body[field] !== undefined) {
      let val = req.body[field];
      if (['dimensions', 'colors', 'materials', 'roomTypes', 'specifications'].includes(field) && typeof val === 'string') {
        val = JSON.parse(val);
      }
      item[field] = val;
    }
  });

  if (req.files && req.files.length > 0) {
    item.images.push(...req.files.map((f) => ({ url: f.path, publicId: f.filename })));
  }

  await item.save();
  return success(res, 200, 'Furniture updated', item);
});

/**
 * @desc    Attach/replace the 3D AR model on a furniture item
 * @route   PUT /api/furniture/:id/model
 * @access  Private/Admin
 */
const uploadModel = asyncHandler(async (req, res) => {
  const item = await Furniture.findById(req.params.id);
  if (!item) throw new ApiError(404, 'Furniture item not found');
  if (!req.file) throw new ApiError(400, 'No 3D model file was uploaded');

  if (item.model3D?.publicId) {
    await cloudinary.uploader.destroy(item.model3D.publicId, { resource_type: 'raw' }).catch(() => {});
  }

  const ext = req.file.originalname.toLowerCase().slice(req.file.originalname.lastIndexOf('.') + 1);
  item.model3D = { url: req.file.path, publicId: req.file.filename, format: ext, scale: item.model3D?.scale };
  await item.save();

  return success(res, 200, '3D model uploaded', item);
});

/**
 * @desc    Delete a furniture item and its Cloudinary assets
 * @route   DELETE /api/furniture/:id
 * @access  Private/Admin
 */
const deleteFurniture = asyncHandler(async (req, res) => {
  const item = await Furniture.findById(req.params.id);
  if (!item) throw new ApiError(404, 'Furniture item not found');

  await Promise.all([
    ...item.images.map((img) => cloudinary.uploader.destroy(img.publicId).catch(() => {})),
    item.model3D?.publicId
      ? cloudinary.uploader.destroy(item.model3D.publicId, { resource_type: 'raw' }).catch(() => {})
      : Promise.resolve(),
  ]);

  await item.deleteOne();
  return success(res, 200, 'Furniture deleted');
});

/**
 * @desc    Remove a single image from a furniture item
 * @route   DELETE /api/furniture/:id/images/:publicId
 * @access  Private/Admin
 */
const deleteFurnitureImage = asyncHandler(async (req, res) => {
  const item = await Furniture.findById(req.params.id);
  if (!item) throw new ApiError(404, 'Furniture item not found');

  const { publicId } = req.params;
  item.images = item.images.filter((img) => img.publicId !== publicId);
  await item.save();
  await cloudinary.uploader.destroy(publicId).catch(() => {});

  return success(res, 200, 'Image removed', item);
});

/**
 * @desc    Get the current user's recently viewed furniture
 * @route   GET /api/furniture/recently-viewed
 * @access  Private
 */
const getRecentlyViewed = asyncHandler(async (req, res) => {
  const items = await RecentlyViewed.find({ user: req.user._id })
    .sort('-viewedAt')
    .limit(20)
    .populate({ path: 'furniture', populate: { path: 'category', select: 'name slug' } });

  return success(res, 200, 'Recently viewed fetched', items.map((rv) => rv.furniture).filter(Boolean));
});

module.exports = {
  getFurniture,
  getFurnitureById,
  createFurniture,
  updateFurniture,
  uploadModel,
  deleteFurniture,
  deleteFurnitureImage,
  getRecentlyViewed,
};
