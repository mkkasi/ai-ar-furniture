const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Furniture = require('../models/Furniture');
const Category = require('../models/Category');
const Review = require('../models/Review');
const SavedDesign = require('../models/SavedDesign');
const { ApiError, success } = require('../utils/apiResponse');

/**
 * @desc    Aggregate dashboard statistics for the admin panel
 * @route   GET /api/admin/stats
 * @access  Private/Admin
 */
const getDashboardStats = asyncHandler(async (req, res) => {
  const [
    totalUsers,
    totalFurniture,
    totalCategories,
    totalReviews,
    totalSavedDesigns,
    topRated,
    newestUsers,
    signupsByDay,
  ] = await Promise.all([
    User.countDocuments({ role: 'user' }),
    Furniture.countDocuments(),
    Category.countDocuments(),
    Review.countDocuments(),
    SavedDesign.countDocuments(),
    Furniture.find().sort('-ratingsAverage').limit(5).select('name ratingsAverage ratingsCount images'),
    User.find({ role: 'user' }).sort('-createdAt').limit(5).select('name email createdAt'),
    User.aggregate([
      { $match: { createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),
  ]);

  return success(res, 200, 'Dashboard stats fetched', {
    totals: { totalUsers, totalFurniture, totalCategories, totalReviews, totalSavedDesigns },
    topRatedFurniture: topRated,
    newestUsers,
    signupsLast30Days: signupsByDay,
  });
});

/**
 * @desc    List users with pagination and search, for admin user management
 * @route   GET /api/admin/users
 * @access  Private/Admin
 */
const listUsers = asyncHandler(async (req, res) => {
  const { q, page = 1, limit = 20 } = req.query;
  const filter = { role: 'user' };
  if (q) filter.$or = [{ name: new RegExp(q, 'i') }, { email: new RegExp(q, 'i') }];

  const pageNum = Math.max(Number(page), 1);
  const limitNum = Math.min(Math.max(Number(limit), 1), 100);

  const [users, total] = await Promise.all([
    User.find(filter).sort('-createdAt').skip((pageNum - 1) * limitNum).limit(limitNum),
    User.countDocuments(filter),
  ]);

  return success(res, 200, 'Users fetched', users.map((u) => u.toPublicJSON()), {
    page: pageNum,
    limit: limitNum,
    total,
    totalPages: Math.ceil(total / limitNum),
  });
});

/**
 * @desc    Enable or disable a user account
 * @route   PUT /api/admin/users/:id/disable
 * @access  Private/Admin
 */
const toggleUserDisabled = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, 'User not found');
  if (user.role === 'admin') throw new ApiError(403, 'Cannot disable an admin account');

  user.isDisabled = req.body.isDisabled ?? !user.isDisabled;
  await user.save();

  return success(res, 200, `User ${user.isDisabled ? 'disabled' : 'enabled'}`, user.toPublicJSON());
});

/**
 * @desc    List all saved AR designs across users (moderation / analytics)
 * @route   GET /api/admin/saved-designs
 * @access  Private/Admin
 */
const listAllSavedDesigns = asyncHandler(async (req, res) => {
  const designs = await SavedDesign.find()
    .sort('-createdAt')
    .limit(100)
    .populate('user', 'name email')
    .populate('placedItems.furniture', 'name');

  return success(res, 200, 'Saved designs fetched', designs);
});

/**
 * @desc    List all reviews across the catalog (moderation)
 * @route   GET /api/admin/reviews
 * @access  Private/Admin
 */
const listAllReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find()
    .sort('-createdAt')
    .limit(200)
    .populate('user', 'name email')
    .populate('furniture', 'name');

  return success(res, 200, 'Reviews fetched', reviews);
});

/**
 * @desc    Delete any review (moderation)
 * @route   DELETE /api/admin/reviews/:id
 * @access  Private/Admin
 */
const deleteAnyReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) throw new ApiError(404, 'Review not found');
  await Review.findOneAndDelete({ _id: review._id });
  return success(res, 200, 'Review deleted');
});

module.exports = { getDashboardStats, listUsers, toggleUserDisabled, listAllSavedDesigns, listAllReviews, deleteAnyReview };
