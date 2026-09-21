/**
 * Seeds the database with a sample admin account, categories, and
 * a handful of furniture items so the app can be demoed immediately.
 *
 * Usage: npm run seed
 */
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const Category = require('../models/Category');
const Furniture = require('../models/Furniture');

const CATEGORIES = [
  { name: 'Living Room', icon: 'weekend', productType: 'furniture' },
  { name: 'Bedroom', icon: 'bed', productType: 'furniture' },
  { name: 'Kitchen', icon: 'kitchen', productType: 'furniture' },
  { name: 'Dining', icon: 'table_restaurant', productType: 'furniture' },
  { name: 'Office', icon: 'chair', productType: 'furniture' },
  { name: 'Outdoor', icon: 'deck', productType: 'furniture' },
  { name: 'Televisions', icon: 'tv', productType: 'appliance' },
  { name: 'Air Conditioners', icon: 'ac_unit', productType: 'appliance' },
];

const run = async () => {
  await connectDB();

  console.log('[Seed] Clearing existing catalog data...');
  await Promise.all([Category.deleteMany({}), Furniture.deleteMany({})]);

  console.log('[Seed] Creating admin account...');
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@arfurniturestudio.com';
  const existingAdmin = await User.findOne({ email: adminEmail });
  if (!existingAdmin) {
    await User.create({
      name: process.env.ADMIN_NAME || 'Super Admin',
      email: adminEmail,
      password: process.env.ADMIN_PASSWORD || 'ChangeMe123!',
      role: 'admin',
      isEmailVerified: true,
    });
  }

  console.log('[Seed] Creating categories...');
  const categories = await Category.insertMany(
    CATEGORIES.map((c, i) => ({ ...c, sortOrder: i }))
  );
  const byName = Object.fromEntries(categories.map((c) => [c.name, c._id]));

  console.log('[Seed] Creating sample furniture...');
  await Furniture.insertMany([
    {
      name: 'Nordic Oak Sofa',
      description: 'A minimalist three-seater sofa with solid oak legs and linen upholstery.',
      category: byName['Living Room'],
      images: [
        { url: 'https://picsum.photos/seed/nordic-oak-sofa/800/600', publicId: 'seed/nordic-oak-sofa-1' },
        { url: 'https://picsum.photos/seed/nordic-oak-sofa-alt/800/600', publicId: 'seed/nordic-oak-sofa-2' },
      ],
      model3D: {
        url: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/GlamVelvetSofa/glTF-Binary/GlamVelvetSofa.glb',
        format: 'glb',
        scale: { x: 1, y: 1, z: 1 },
      },
      dimensions: { widthCm: 210, heightCm: 85, depthCm: 90, weightKg: 45 },
      materials: ['Oak', 'Linen'],
      colors: [{ name: 'Sand', hexCode: '#D8CBB8' }, { name: 'Charcoal', hexCode: '#3A3A3A' }],
      roomTypes: ['living_room'],
      stock: 12,
      isFeatured: true,
      isTrending: true,
      sku: 'SOF-NORD-001',
    },
    {
      name: 'Halo Platform Bed Frame',
      description: 'Low-profile queen bed frame with an upholstered headboard.',
      category: byName['Bedroom'],
      images: [
        { url: 'https://picsum.photos/seed/halo-platform-bed-frame/800/600', publicId: 'seed/halo-platform-bed-frame-1' },
        { url: 'https://picsum.photos/seed/halo-platform-bed-frame-alt/800/600', publicId: 'seed/halo-platform-bed-frame-2' },
      ],
      dimensions: { widthCm: 160, heightCm: 100, depthCm: 210, weightKg: 55 },
      materials: ['Walnut Veneer', 'Boucle'],
      colors: [{ name: 'Ivory', hexCode: '#F2EDE4' }],
      roomTypes: ['bedroom'],
      stock: 8,
      isTrending: true,
      sku: 'BED-HALO-002',
    },
    {
      name: 'Arc Dining Table',
      description: 'Round dining table seating 6, with a curved pedestal base.',
      category: byName['Dining'],
      images: [
        { url: 'https://picsum.photos/seed/arc-dining-table/800/600', publicId: 'seed/arc-dining-table-1' },
        { url: 'https://picsum.photos/seed/arc-dining-table-alt/800/600', publicId: 'seed/arc-dining-table-2' },
      ],
      dimensions: { widthCm: 140, heightCm: 75, depthCm: 140, weightKg: 38 },
      materials: ['Ash Wood'],
      colors: [{ name: 'Natural', hexCode: '#C9A876' }],
      roomTypes: ['dining'],
      stock: 15,
      isFeatured: true,
      sku: 'TBL-ARC-003',
    },
    {
      name: 'Meridian Office Chair',
      description: 'Ergonomic mesh-back task chair with adjustable lumbar support.',
      category: byName['Office'],
      images: [
        { url: 'https://picsum.photos/seed/meridian-office-chair/800/600', publicId: 'seed/meridian-office-chair-1' },
        { url: 'https://picsum.photos/seed/meridian-office-chair-alt/800/600', publicId: 'seed/meridian-office-chair-2' },
      ],
      model3D: {
        url: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/SheenChair/glTF-Binary/SheenChair.glb',
        format: 'glb',
        scale: { x: 1, y: 1, z: 1 },
      },
      dimensions: { widthCm: 65, heightCm: 115, depthCm: 65, weightKg: 18 },
      materials: ['Mesh', 'Aluminum'],
      colors: [{ name: 'Graphite', hexCode: '#4A4A4A' }],
      roomTypes: ['office'],
      stock: 20,
      sku: 'CHR-MER-004',
    },
    {
      name: 'Coastal Teak Lounger',
      description: 'Weather-resistant teak sun lounger with adjustable backrest.',
      category: byName['Outdoor'],
      images: [
        { url: 'https://picsum.photos/seed/coastal-teak-lounger/800/600', publicId: 'seed/coastal-teak-lounger-1' },
        { url: 'https://picsum.photos/seed/coastal-teak-lounger-alt/800/600', publicId: 'seed/coastal-teak-lounger-2' },
      ],
      model3D: {
        url: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/ChairDamaskPurplegold/glTF-Binary/ChairDamaskPurplegold.glb',
        format: 'glb',
        scale: { x: 1, y: 1, z: 1 },
      },
      dimensions: { widthCm: 65, heightCm: 35, depthCm: 195, weightKg: 22 },
      materials: ['Teak'],
      colors: [{ name: 'Natural Teak', hexCode: '#B5895B' }],
      roomTypes: ['outdoor'],
      stock: 10,
      isTrending: true,
      sku: 'LNG-COAST-005',
    },
    {
      name: 'Vantage 55" 4K Smart TV',
      description: 'A 55-inch 4K UHD smart TV with HDR10 and built-in streaming apps — wall-mountable or stand-included.',
      itemType: 'appliance',
      category: byName['Televisions'],
      images: [
        { url: 'https://picsum.photos/seed/vantage-55-4k-smart-tv/800/600', publicId: 'seed/vantage-55-4k-smart-tv-1' },
        { url: 'https://picsum.photos/seed/vantage-55-4k-smart-tv-alt/800/600', publicId: 'seed/vantage-55-4k-smart-tv-2' },
      ],
      dimensions: { widthCm: 123, heightCm: 71, depthCm: 8, weightKg: 14 },
      specifications: [
        { key: 'Screen Size', value: '55 inch' },
        { key: 'Resolution', value: '4K UHD (3840x2160)' },
        { key: 'HDR', value: 'HDR10, Dolby Vision' },
        { key: 'Smart Platform', value: 'Built-in streaming (apps store)' },
        { key: 'HDMI Ports', value: '4x HDMI 2.1' },
        { key: 'Mount Type', value: 'VESA 400x400, wall mount or included stand' },
      ],
      voltage: '120V',
      powerConsumptionWatts: 110,
      energyRating: 'Energy Star Certified',
      colors: [{ name: 'Matte Black', hexCode: '#1A1A1A' }],
      roomTypes: ['living_room', 'bedroom', 'office'],
      stock: 25,
      isFeatured: true,
      isTrending: true,
      sku: 'TV-VANT-006',
    },
    {
      name: 'Breeze Pro 12,000 BTU Split AC',
      description: 'A ductless mini-split air conditioner sized for rooms up to 550 sq ft, with a wall-mounted indoor unit and quiet outdoor compressor.',
      itemType: 'appliance',
      category: byName['Air Conditioners'],
      images: [
        { url: 'https://picsum.photos/seed/breeze-pro-12000-btu-split-ac/800/600', publicId: 'seed/breeze-pro-12000-btu-split-ac-1' },
        { url: 'https://picsum.photos/seed/breeze-pro-12000-btu-split-ac-alt/800/600', publicId: 'seed/breeze-pro-12000-btu-split-ac-2' },
      ],
      dimensions: { widthCm: 80, heightCm: 30, depthCm: 21, weightKg: 12 },
      specifications: [
        { key: 'Cooling Capacity', value: '12,000 BTU/hr' },
        { key: 'Coverage Area', value: 'Up to 550 sq ft' },
        { key: 'Type', value: 'Ductless mini-split (indoor + outdoor unit)' },
        { key: 'SEER Rating', value: '21 SEER' },
        { key: 'Noise Level', value: '26 dB (indoor unit, low fan)' },
        { key: 'Remote Control', value: 'Included, with programmable timer' },
      ],
      voltage: '240V',
      powerConsumptionWatts: 1100,
      energyRating: 'Energy Star Certified',
      colors: [{ name: 'White', hexCode: '#F5F5F5' }],
      roomTypes: ['living_room', 'bedroom', 'office'],
      stock: 10,
      isTrending: true,
      sku: 'AC-BRZ-007',
    },
    {
      name: 'CoolWave 8,000 BTU Window AC',
      description: 'A compact window-mounted air conditioner for single rooms up to 350 sq ft — easy DIY install, no outdoor unit required.',
      itemType: 'appliance',
      category: byName['Air Conditioners'],
      images: [
        { url: 'https://picsum.photos/seed/coolwave-8000-btu-window-ac/800/600', publicId: 'seed/coolwave-8000-btu-window-ac-1' },
        { url: 'https://picsum.photos/seed/coolwave-8000-btu-window-ac-alt/800/600', publicId: 'seed/coolwave-8000-btu-window-ac-2' },
      ],
      dimensions: { widthCm: 48, heightCm: 36, depthCm: 53, weightKg: 22 },
      specifications: [
        { key: 'Cooling Capacity', value: '8,000 BTU/hr' },
        { key: 'Coverage Area', value: 'Up to 350 sq ft' },
        { key: 'Type', value: 'Window-mounted, single unit' },
        { key: 'Energy Efficiency Ratio', value: '12.1 EER' },
        { key: 'Fan Speeds', value: '3-speed with sleep mode' },
      ],
      voltage: '120V',
      powerConsumptionWatts: 750,
      energyRating: 'Energy Star Certified',
      colors: [{ name: 'White', hexCode: '#F5F5F5' }],
      roomTypes: ['bedroom', 'office'],
      stock: 18,
      sku: 'AC-COOL-008',
    },
    {
      name: 'Rustic Barn Lamp',
      description: 'A weathered-metal barn-style lamp with a warm anisotropic sheen finish, great for a reading corner or entryway.',
      itemType: 'furniture',
      category: byName['Living Room'],
      images: [
        { url: 'https://picsum.photos/seed/rustic-barn-lamp/800/600', publicId: 'seed/rustic-barn-lamp-1' },
      ],
      model3D: {
        url: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/AnisotropyBarnLamp/glTF-Binary/AnisotropyBarnLamp.glb',
        format: 'glb',
        scale: { x: 1, y: 1, z: 1 },
      },
      dimensions: { widthCm: 28, heightCm: 45, depthCm: 28, weightKg: 3 },
      materials: ['Brushed Metal'],
      colors: [{ name: 'Bronze', hexCode: '#8C7853' }],
      roomTypes: ['living_room', 'office'],
      stock: 15,
      sku: 'LMP-BARN-009',
    },
    {
      name: 'Punctual Table Lamp',
      description: 'A modern accent table lamp with a soft, direct light profile - a compact piece for a nightstand or side table.',
      itemType: 'furniture',
      category: byName['Bedroom'],
      images: [
        { url: 'https://picsum.photos/seed/punctual-table-lamp/800/600', publicId: 'seed/punctual-table-lamp-1' },
      ],
      model3D: {
        url: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/LightsPunctualLamp/glTF-Binary/LightsPunctualLamp.glb',
        format: 'glb',
        scale: { x: 1, y: 1, z: 1 },
      },
      dimensions: { widthCm: 20, heightCm: 38, depthCm: 20, weightKg: 2 },
      materials: ['Ceramic', 'Fabric'],
      colors: [{ name: 'Cream', hexCode: '#F2E9DC' }],
      roomTypes: ['bedroom', 'living_room'],
      stock: 22,
      sku: 'LMP-PUNCT-010',
    },
  ]);

  console.log('[Seed] Done.');
  await mongoose.connection.close();
  process.exit(0);
};

run().catch((err) => {
  console.error('[Seed] Failed:', err);
  process.exit(1);
});
