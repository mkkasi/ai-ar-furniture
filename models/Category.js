const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      unique: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    icon: { type: String, default: null }, // icon name or URL
    // Lets the client group categories into "Furniture" vs "Appliances"
    // sections/tabs without hardcoding category names on the frontend.
    productType: {
      type: String,
      enum: ['furniture', 'appliance'],
      default: 'furniture',
      index: true,
    },
    image: {
      url: { type: String, default: null },
      publicId: { type: String, default: null },
    },
    description: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

categorySchema.pre('validate', function generateSlug(next) {
  if (this.name && !this.slug) {
    this.slug = this.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }
  next();
});

module.exports = mongoose.model('Category', categorySchema);
