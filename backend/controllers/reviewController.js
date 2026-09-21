const asyncHandler = require('express-async-handler');
const Review = require('../models/Review');
const Furniture = require('../models/Furniture');
const { ApiError, success } = require('../utils/apiResponse');

/**
 * @desc    List reviews for a furniture item
 * @route   GET /api/furniture/:furnitureId/reviews
 * @access  Public
 */
const getReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ furniture: req.params.furnitureId })
    .sort('-createdAt')
    .populate('user', 'name avatar');
  return success(res, 200, 'Reviews fetched', reviews);
});

/**
 * @desc    Create a review for a furniture item
 * @route   POST /api/furniture/:furnitureId/reviews
 * @access  Private
 */
const createReview = asyncHandler(async (req, res) => {
  const { furnitureId } = req.params;
  const { rating, comment } = req.body;

  const furniture = await Furniture.findById(furnitureId);
  if (!furniture) throw new ApiError(404, 'Furniture item not found');

  const existing = await Review.findOne({ user: req.user._id, furniture: furnitureId });
  if (existing) throw new ApiError(409, 'You have already reviewed this item');

  const review = await Review.create({
    user: req.user._id,
    furniture: furnitureId,
    rating,
    comment,
  });

  return success(res, 201, 'Review submitted', review);
});

/**
 * @desc    Update the current user's review
 * @route   PUT /api/reviews/:id
 * @access  Private
 */
const updateReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) throw new ApiError(404, 'Review not found');
  if (String(review.user) !== String(req.user._id)) {
    throw new ApiError(403, 'You can only edit your own review');
  }

  if (req.body.rating !== undefined) review.rating = req.body.rating;
  if (req.body.comment !== undefined) review.comment = req.body.comment;
  await review.save();

  return success(res, 200, 'Review updated', review);
});

/**
 * @desc    Delete the current user's review (or any review if admin)
 * @route   DELETE /api/reviews/:id
 * @access  Private
 */
const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) throw new ApiError(404, 'Review not found');
  if (String(review.user) !== String(req.user._id) && req.user.role !== 'admin') {
    throw new ApiError(403, 'Not authorized to delete this review');
  }

  await Review.findOneAndDelete({ _id: review._id });
  return success(res, 200, 'Review deleted');
});

module.exports = { getReviews, createReview, updateReview, deleteReview };
