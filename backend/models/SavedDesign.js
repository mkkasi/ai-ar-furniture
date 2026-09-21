const mongoose = require('mongoose');

const placedItemSchema = new mongoose.Schema(
  {
    furniture: { type: mongoose.Schema.Types.ObjectId, ref: 'Furniture', required: true },
    position: {
      x: { type: Number, required: true },
      y: { type: Number, required: true },
      z: { type: Number, required: true },
    },
    rotation: {
      x: { type: Number, default: 0 },
      y: { type: Number, default: 0 },
      z: { type: Number, default: 0 },
    },
    scale: {
      x: { type: Number, default: 1 },
      y: { type: Number, default: 1 },
      z: { type: Number, default: 1 },
    },
  },
  { _id: false }
);

const savedDesignSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, trim: true, maxlength: 100 },
    roomType: {
      type: String,
      enum: ['living_room', 'bedroom', 'kitchen', 'dining', 'office', 'outdoor'],
      default: 'living_room',
    },
    screenshot: {
      url: { type: String, default: null },
      publicId: { type: String, default: null },
    },
    placedItems: [placedItemSchema],
    roomDimensions: {
      widthM: { type: Number, default: null },
      lengthM: { type: Number, default: null },
    },
    isShared: { type: Boolean, default: false },
    shareToken: { type: String, default: null, unique: true, sparse: true },
  },
  { timestamps: true }
);

savedDesignSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('SavedDesign', savedDesignSchema);
