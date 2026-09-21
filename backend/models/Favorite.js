const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    furniture: { type: mongoose.Schema.Types.ObjectId, ref: 'Furniture', required: true },
  },
  { timestamps: true }
);

// Prevent duplicate favorites for the same user/furniture pair
favoriteSchema.index({ user: 1, furniture: 1 }, { unique: true });

module.exports = mongoose.model('Favorite', favoriteSchema);
