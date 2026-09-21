const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    body: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ['offer', 'new_arrival', 'system', 'order'],
      default: 'system',
    },
    image: { type: String, default: null },
    // If null, notification is broadcast to all users. Otherwise targeted.
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    data: { type: mongoose.Schema.Types.Mixed, default: {} }, // deep-link payload
    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

notificationSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
