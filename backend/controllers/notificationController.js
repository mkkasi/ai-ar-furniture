const asyncHandler = require('express-async-handler');
const Notification = require('../models/Notification');
const { ApiError, success } = require('../utils/apiResponse');

/**
 * @desc    Get notifications for the current user (personal + broadcast)
 * @route   GET /api/notifications
 * @access  Private
 */
const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({
    $or: [{ user: req.user._id }, { user: null }],
  }).sort('-createdAt').limit(50);

  const withReadState = notifications.map((n) => ({
    ...n.toObject(),
    isRead: n.readBy.some((id) => String(id) === String(req.user._id)),
  }));

  return success(res, 200, 'Notifications fetched', withReadState);
});

/**
 * @desc    Mark a notification as read
 * @route   PUT /api/notifications/:id/read
 * @access  Private
 */
const markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findById(req.params.id);
  if (!notification) throw new ApiError(404, 'Notification not found');

  if (!notification.readBy.some((id) => String(id) === String(req.user._id))) {
    notification.readBy.push(req.user._id);
    await notification.save();
  }

  return success(res, 200, 'Notification marked as read');
});

/**
 * @desc    Create/broadcast a notification (targeted or global)
 * @route   POST /api/notifications
 * @access  Private/Admin
 */
const createNotification = asyncHandler(async (req, res) => {
  const { title, body, type, image, userId, data } = req.body;

  const notification = await Notification.create({
    title,
    body,
    type,
    image,
    user: userId || null,
    data: data || {},
  });

  // NOTE: Actual push delivery (FCM/APNs) is wired up in a dedicated push-service
  // module that reads target users' fcmTokens and calls the FCM Admin SDK.
  return success(res, 201, 'Notification created', notification);
});

module.exports = { getNotifications, markAsRead, createNotification };
