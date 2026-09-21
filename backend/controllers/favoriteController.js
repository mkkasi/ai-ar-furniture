const asyncHandler = require('express-async-handler');
const Favorite = require('../models/Favorite');
const Furniture = require('../models/Furniture');
const { ApiError, success } = require('../utils/apiResponse');

/**
 * @desc    Get the current user's favorites (wishlist)
 * @route   GET /api/favorites
 * @access  Private
 */
const getFavorites = asyncHandler(async (req, res) => {
  const favorites = await Favorite.find({ user: req.user._id })
    .sort('-createdAt')
    .populate({ path: 'furniture', populate: { path: 'category', select: 'name slug' } });

  return success(res, 200, 'Favorites fetched', favorites.map((f) => f.furniture).filter(Boolean));
});

/**
 * @desc    Add a furniture item to favorites
 * @route   POST /api/favorites
 * @access  Private
 */
const addFavorite = asyncHandler(async (req, res) => {
  const { furnitureId } = req.body;

  const furniture = await Furniture.findById(furnitureId);
  if (!furniture) throw new ApiError(404, 'Furniture item not found');

  const existing = await Favorite.findOne({ user: req.user._id, furniture: furnitureId });
  if (existing) throw new ApiError(409, 'Already in favorites');

  await Favorite.create({ user: req.user._id, furniture: furnitureId });
  return success(res, 201, 'Added to favorites');
});

/**
 * @desc    Remove a furniture item from favorites
 * @route   DELETE /api/favorites/:furnitureId
 * @access  Private
 */
const removeFavorite = asyncHandler(async (req, res) => {
  const result = await Favorite.findOneAndDelete({
    user: req.user._id,
    furniture: req.params.furnitureId,
  });
  if (!result) throw new ApiError(404, 'Favorite not found');
  return success(res, 200, 'Removed from favorites');
});

module.exports = { getFavorites, addFavorite, removeFavorite };
