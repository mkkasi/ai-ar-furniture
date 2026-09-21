const express = require('express');
const { body } = require('express-validator');
const categoryController = require('../controllers/categoryController');
const { protect, adminOnly, optionalAuth } = require('../middleware/authMiddleware');
const validate = require('../middleware/validateMiddleware');
const multer = require('multer');
const { imageStorage } = require('../config/cloudinary');

const router = express.Router();
const uploadCategoryImage = multer({ storage: imageStorage }).single('image');

router.get('/', optionalAuth, categoryController.getCategories);
router.get('/:idOrSlug', categoryController.getCategory);

router.post(
  '/',
  protect,
  adminOnly,
  uploadCategoryImage,
  [body('name').trim().notEmpty().withMessage('Category name is required')],
  validate,
  categoryController.createCategory
);

router.put('/:id', protect, adminOnly, uploadCategoryImage, categoryController.updateCategory);
router.delete('/:id', protect, adminOnly, categoryController.deleteCategory);

module.exports = router;
