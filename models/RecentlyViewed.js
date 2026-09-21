const mongoose = require('mongoose');

const recentlyViewedSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    furniture: { type: mongoose.Schema.Types.ObjectId, ref: 'Furniture', required: true },
    viewedAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

recentlyViewedSchema.index({ user: 1, furniture: 1 }, { unique: true });
recentlyViewedSchema.index({ user: 1, viewedAt: -1 });

module.exports = mongoose.model('RecentlyViewed', recentlyViewedSchema);
