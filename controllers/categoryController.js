const asyncHandler = require('express-async-handler');
const Category = require('../models/Category');
const Furniture = require('../models/Furniture');
const { cloudinary } = require('../config/cloudinary');
const { ApiError, success } = require('../utils/apiResponse');

/**
 * @desc    List all active categories
 * @route   GET /api/categories
 * @access  Public
 */
const getCategories = asyncHandler(async (req, res) => {
  const includeInactive = req.query.includeInactive === 'true' && req.user?.role === 'admin';
  const filter = includeInactive ? {} : { isActive: true };
  if (req.query.productType) filter.productType = req.query.productType;
  const categories = await Category.find(filter).sort('sortOrder name');
  return success(res, 200, 'Categories fetched', categories);
});

/**
 * @desc    Get a single category by ID or slug
 * @route   GET /api/categories/:idOrSlug
 * @access  Public
 */
const getCategory = asyncHandler(async (req, res) => {
  const { idOrSlug } = req.params;
  const query = idOrSlug.match(/^[0-9a-fA-F]{24}$/) ? { _id: idOrSlug } : { slug: idOrSlug };
  const category = await Category.findOne(query);
  if (!category) throw new ApiError(404, 'Category not found');
  return success(res, 200, 'Category fetched', category);
});

/**
 * @desc    Create a category
 * @route   POST /api/categories
 * @access  Private/Admin
 */
const createCategory = asyncHandler(async (req, res) => {
  const { name, description, icon, sortOrder, productType } = req.body;
  const payload = { name, description, icon, sortOrder, productType };
  if (req.file) payload.image = { url: req.file.path, publicId: req.file.filename };

  const category = await Category.create(payload);
  return success(res, 201, 'Category created', category);
});

/**
 * @desc    Update a category
 * @route   PUT /api/categories/:id
 * @access  Private/Admin
 */
const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) throw new ApiError(404, 'Category not found');

  ['name', 'description', 'icon', 'sortOrder', 'isActive', 'productType'].forEach((field) => {
    if (req.body[field] !== undefined) category[field] = req.body[field];
  });

  if (req.file) {
    if (category.image?.publicId) {
      await cloudinary.uploader.destroy(category.image.publicId).catch(() => {});
    }
    category.image = { url: req.file.path, publicId: req.file.filename };
  }

  await category.save();
  return success(res, 200, 'Category updated', category);
});

/**
 * @desc    Delete a category (blocked if furniture items still reference it)
 * @route   DELETE /api/categories/:id
 * @access  Private/Admin
 */
const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) throw new ApiError(404, 'Category not found');

  const inUse = await Furniture.countDocuments({ category: category._id });
  if (inUse > 0) {
    throw new ApiError(409, `Cannot delete category: ${inUse} furniture item(s) still use it`);
  }

  if (category.image?.publicId) {
    await cloudinary.uploader.destroy(category.image.publicId).catch(() => {});
  }
  await category.deleteOne();
  return success(res, 200, 'Category deleted');
});

module.exports = { getCategories, getCategory, createCategory, updateCategory, deleteCategory };
