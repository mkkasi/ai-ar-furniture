const mongoose = require('mongoose');

const furnitureSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Furniture name is required'],
      trim: true,
      maxlength: 120,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    // 'furniture' covers sofas/beds/tables etc; 'appliance' covers items
    // like TVs and air conditioners, which share the same catalog,
    // AR-placement, and ordering pipeline but carry different technical
    // specs (see `specifications` below) instead of materials/colors.
    itemType: {
      type: String,
      enum: ['furniture', 'appliance'],
      default: 'furniture',
      index: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required'],
    },
    images: [
      {
        url: { type: String, required: true },
        publicId: { type: String, required: true },
      },
    ],
    model3D: {
      url: { type: String, default: null }, // .glb / .usdz URL for AR placement
      publicId: { type: String, default: null },
      format: { type: String, enum: ['glb', 'usdz', 'gltf', null], default: null },
      scale: {
        x: { type: Number, default: 1 },
        y: { type: Number, default: 1 },
        z: { type: Number, default: 1 },
      },
    },
    dimensions: {
      widthCm: { type: Number, required: true },
      heightCm: { type: Number, required: true },
      depthCm: { type: Number, required: true },
      weightKg: { type: Number, default: null },
    },
    materials: [{ type: String, trim: true }],
    colors: [
      {
        name: { type: String, required: true },
        hexCode: { type: String, required: true },
      },
    ],
    // Free-form key/value technical specs, primarily for appliances -
    // e.g. { key: 'Screen Size', value: '55 inch' } for a TV, or
    // { key: 'Cooling Capacity', value: '12,000 BTU' } for an AC.
    // Kept generic (rather than a rigid per-appliance-type schema) so the
    // admin dashboard can describe any current or future appliance type
    // without a backend migration.
    specifications: [
      {
        key: { type: String, required: true, trim: true },
        value: { type: String, required: true, trim: true },
      },
    ],
    // US-market appliance fields. Left optional/null for furniture items.
    voltage: {
      type: String,
      enum: ['120V', '240V', null],
      default: null,
    },
    powerConsumptionWatts: {
      type: Number,
      default: null,
      min: 0,
    },
    energyRating: {
      // US Energy Star program uses a simple certified/not-certified
      // flag rather than the EU's A–G letter scale.
      type: String,
      enum: ['Energy Star Certified', 'Standard', null],
      default: null,
    },
    roomTypes: [
      {
        type: String,
        enum: ['living_room', 'bedroom', 'kitchen', 'dining', 'office', 'outdoor'],
      },
    ],
    stock: {
      type: Number,
      default: 0,
      min: 0,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isTrending: {
      type: Boolean,
      default: false,
    },
    ratingsAverage: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
      set: (val) => Math.round(val * 10) / 10,
    },
    ratingsCount: {
      type: Number,
      default: 0,
    },
    viewCount: {
      type: Number,
      default: 0,
    },
    sku: {
      type: String,
      unique: true,
      sparse: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

furnitureSchema.index({ name: 'text', description: 'text', materials: 'text' });
furnitureSchema.index({ category: 1, isAvailable: 1 });
furnitureSchema.index({ itemType: 1, isAvailable: 1 });
furnitureSchema.index({ isTrending: 1, isFeatured: 1 });

module.exports = mongoose.model('Furniture', furnitureSchema);
