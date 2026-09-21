const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// Storage engine for furniture images (jpg/png/webp)
const imageStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'ar-furniture-studio/furniture-images',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 1600, height: 1600, crop: 'limit', quality: 'auto' }],
  },
});

// Storage engine for 3D models (.glb / .usdz) — stored as raw resource type
const modelStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'ar-furniture-studio/furniture-models',
    resource_type: 'raw',
    allowed_formats: ['glb', 'usdz', 'gltf'],
  },
});

// Storage engine for user avatars
const avatarStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'ar-furniture-studio/avatars',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 512, height: 512, crop: 'fill', gravity: 'face' }],
  },
});

// Storage engine for AR design screenshots
const designStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'ar-furniture-studio/saved-designs',
    allowed_formats: ['jpg', 'jpeg', 'png'],
    transformation: [{ width: 1200, crop: 'limit', quality: 'auto' }],
  },
});

// Storage engine for room photos uploaded to the AI Interior Design feature
const roomPhotoStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'ar-furniture-studio/room-photos',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 1600, crop: 'limit', quality: 'auto' }],
  },
});

// Storage engine for reference photos uploaded to the AI Visual Search feature
// (a photo of any furniture/appliance the user wants to find similar items for)
const visualSearchStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'ar-furniture-studio/visual-search',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 1600, crop: 'limit', quality: 'auto' }],
  },
});

module.exports = {
  cloudinary,
  imageStorage,
  modelStorage,
  avatarStorage,
  designStorage,
  roomPhotoStorage,
  visualSearchStorage,
};
