const multer = require('multer');
const { imageStorage, modelStorage, avatarStorage, designStorage, roomPhotoStorage, visualSearchStorage } = require('../config/cloudinary');

const MAX_IMAGE_SIZE = 8 * 1024 * 1024; // 8MB
const MAX_MODEL_SIZE = 50 * 1024 * 1024; // 50MB for .glb/.usdz

const imageFileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp'];
  if (allowed.includes(file.mimetype)) return cb(null, true);
  cb(new Error('Only JPG, PNG, and WEBP images are allowed'), false);
};

const modelFileFilter = (req, file, cb) => {
  const allowedExt = ['.glb', '.usdz', '.gltf'];
  const ext = file.originalname.toLowerCase().slice(file.originalname.lastIndexOf('.'));
  if (allowedExt.includes(ext)) return cb(null, true);
  cb(new Error('Only .glb, .usdz, or .gltf 3D model files are allowed'), false);
};

const uploadFurnitureImages = multer({
  storage: imageStorage,
  limits: { fileSize: MAX_IMAGE_SIZE, files: 8 },
  fileFilter: imageFileFilter,
}).array('images', 8);

const uploadFurnitureModel = multer({
  storage: modelStorage,
  limits: { fileSize: MAX_MODEL_SIZE, files: 1 },
  fileFilter: modelFileFilter,
}).single('model3D');

const uploadAvatar = multer({
  storage: avatarStorage,
  limits: { fileSize: MAX_IMAGE_SIZE, files: 1 },
  fileFilter: imageFileFilter,
}).single('avatar');

const uploadDesignScreenshot = multer({
  storage: designStorage,
  limits: { fileSize: MAX_IMAGE_SIZE, files: 1 },
  fileFilter: imageFileFilter,
}).single('screenshot');

const uploadRoomPhoto = multer({
  storage: roomPhotoStorage,
  limits: { fileSize: MAX_IMAGE_SIZE, files: 1 },
  fileFilter: imageFileFilter,
}).single('roomPhoto');

const uploadVisualSearchPhoto = multer({
  storage: visualSearchStorage,
  limits: { fileSize: MAX_IMAGE_SIZE, files: 1 },
  fileFilter: imageFileFilter,
}).single('photo');

module.exports = {
  uploadFurnitureImages,
  uploadFurnitureModel,
  uploadAvatar,
  uploadDesignScreenshot,
  uploadRoomPhoto,
  uploadVisualSearchPhoto,
};
