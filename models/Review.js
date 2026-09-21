const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    furniture: { type: mongoose.Schema.Types.ObjectId, ref: 'Furniture', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, trim: true, maxlength: 1000 },
    images: [{ url: String, publicId: String }],
  },
  { timestamps: true }
);

reviewSchema.index({ user: 1, furniture: 1 }, { unique: true });

// Recalculate the parent furniture's rating aggregate whenever a review changes
reviewSchema.statics.recalculateRatings = async function recalculateRatings(furnitureId) {
  const Furniture = mongoose.model('Furniture');
  const stats = await this.aggregate([
    { $match: { furniture: furnitureId } },
    { $group: { _id: '$furniture', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);

  if (stats.length > 0) {
    await Furniture.findByIdAndUpdate(furnitureId, {
      ratingsAverage: stats[0].avgRating,
      ratingsCount: stats[0].count,
    });
  } else {
    await Furniture.findByIdAndUpdate(furnitureId, { ratingsAverage: 0, ratingsCount: 0 });
  }
};

reviewSchema.post('save', function () {
  this.constructor.recalculateRatings(this.furniture);
});

reviewSchema.post('findOneAndDelete', function (doc) {
  if (doc) doc.constructor.recalculateRatings(doc.furniture);
});

module.exports = mongoose.model('Review', reviewSchema);
