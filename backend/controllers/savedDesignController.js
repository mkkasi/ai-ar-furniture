const asyncHandler = require('express-async-handler');
const crypto = require('crypto');
const SavedDesign = require('../models/SavedDesign');
const { cloudinary } = require('../config/cloudinary');
const { ApiError, success } = require('../utils/apiResponse');

/**
 * @desc    List the current user's saved AR designs
 * @route   GET /api/saved-designs
 * @access  Private
 */
const getSavedDesigns = asyncHandler(async (req, res) => {
  const designs = await SavedDesign.find({ user: req.user._id })
    .sort('-createdAt')
    .populate('placedItems.furniture', 'name images model3D');
  return success(res, 200, 'Saved designs fetched', designs);
});

/**
 * @desc    Get a single saved design by ID (owner only, or via share token)
 * @route   GET /api/saved-designs/:id
 * @access  Private
 */
const getSavedDesign = asyncHandler(async (req, res) => {
  const design = await SavedDesign.findById(req.params.id).populate(
    'placedItems.furniture',
    'name images model3D dimensions'
  );
  if (!design) throw new ApiError(404, 'Saved design not found');
  if (String(design.user) !== String(req.user._id)) {
    throw new ApiError(403, 'Not authorized to view this design');
  }
  return success(res, 200, 'Saved design fetched', design);
});

/**
 * @desc    Save a new AR room design (placed items + optional screenshot)
 * @route   POST /api/saved-designs
 * @access  Private
 */
const createSavedDesign = asyncHandler(async (req, res) => {
  const { name, roomType, placedItems, roomDimensions } = req.body;

  const parsedItems = typeof placedItems === 'string' ? JSON.parse(placedItems) : placedItems;
  const parsedDims = typeof roomDimensions === 'string' ? JSON.parse(roomDimensions) : roomDimensions;

  if (!Array.isArray(parsedItems) || parsedItems.length === 0) {
    throw new ApiError(400, 'At least one placed item is required to save a design');
  }

  const payload = {
    user: req.user._id,
    name,
    roomType,
    placedItems: parsedItems,
    roomDimensions: parsedDims,
  };
  if (req.file) payload.screenshot = { url: req.file.path, publicId: req.file.filename };

  const design = await SavedDesign.create(payload);
  return success(res, 201, 'Design saved', design);
});

/**
 * @desc    Rename or update a saved design (name, placed items, screenshot)
 * @route   PUT /api/saved-designs/:id
 * @access  Private
 */
const updateSavedDesign = asyncHandler(async (req, res) => {
  const design = await SavedDesign.findById(req.params.id);
  if (!design) throw new ApiError(404, 'Saved design not found');
  if (String(design.user) !== String(req.user._id)) {
    throw new ApiError(403, 'Not authorized to edit this design');
  }

  const { name, placedItems, roomDimensions } = req.body;
  if (name !== undefined) design.name = name;
  if (placedItems !== undefined) {
    design.placedItems = typeof placedItems === 'string' ? JSON.parse(placedItems) : placedItems;
  }
  if (roomDimensions !== undefined) {
    design.roomDimensions = typeof roomDimensions === 'string' ? JSON.parse(roomDimensions) : roomDimensions;
  }
  if (req.file) {
    if (design.screenshot?.publicId) {
      await cloudinary.uploader.destroy(design.screenshot.publicId).catch(() => {});
    }
    design.screenshot = { url: req.file.path, publicId: req.file.filename };
  }

  await design.save();
  return success(res, 200, 'Design updated', design);
});

/**
 * @desc    Delete a saved design
 * @route   DELETE /api/saved-designs/:id
 * @access  Private
 */
const deleteSavedDesign = asyncHandler(async (req, res) => {
  const design = await SavedDesign.findById(req.params.id);
  if (!design) throw new ApiError(404, 'Saved design not found');
  if (String(design.user) !== String(req.user._id)) {
    throw new ApiError(403, 'Not authorized to delete this design');
  }

  if (design.screenshot?.publicId) {
    await cloudinary.uploader.destroy(design.screenshot.publicId).catch(() => {});
  }
  await design.deleteOne();
  return success(res, 200, 'Design deleted');
});

/**
 * @desc    Generate (or return existing) a public share link for a design
 * @route   POST /api/saved-designs/:id/share
 * @access  Private
 */
const shareSavedDesign = asyncHandler(async (req, res) => {
  const design = await SavedDesign.findById(req.params.id);
  if (!design) throw new ApiError(404, 'Saved design not found');
  if (String(design.user) !== String(req.user._id)) {
    throw new ApiError(403, 'Not authorized to share this design');
  }

  if (!design.shareToken) {
    design.shareToken = crypto.randomBytes(12).toString('hex');
  }
  design.isShared = true;
  await design.save();

  return success(res, 200, 'Share link generated', { shareToken: design.shareToken });
});

/**
 * @desc    View a shared design via its public token (no auth required)
 * @route   GET /api/saved-designs/shared/:shareToken
 * @access  Public
 */
const getSharedDesign = asyncHandler(async (req, res) => {
  const design = await SavedDesign.findOne({ shareToken: req.params.shareToken, isShared: true }).populate(
    'placedItems.furniture',
    'name images model3D'
  );
  if (!design) throw new ApiError(404, 'Shared design not found or no longer available');
  return success(res, 200, 'Shared design fetched', design);
});

module.exports = {
  getSavedDesigns,
  getSavedDesign,
  createSavedDesign,
  updateSavedDesign,
  deleteSavedDesign,
  shareSavedDesign,
  getSharedDesign,
};
