const express = require('express');
const { body } = require('express-validator');
const furnitureController = require('../controllers/furnitureController');
const reviewController = require('../controllers/reviewController');
const { protect, adminOnly, optionalAuth } = require('../middleware/authMiddleware');
const validate = require('../middleware/validateMiddleware');
const { uploadFurnitureImages, uploadFurnitureModel } = require('../middleware/uploadMiddleware');

const router = express.Router();

router.get('/recently-viewed', protect, furnitureController.getRecentlyViewed);

router.get('/', optionalAuth, furnitureController.getFurniture);

router.post(
  '/',
  protect,
  adminOnly,
  uploadFurnitureImages,
  [
    body('name').trim().notEmpty(),
    body('description').trim().notEmpty(),
    body('category').isMongoId(),
  ],
  validate,
  furnitureController.createFurniture
);

router.get('/:id', optionalAuth, furnitureController.getFurnitureById);
router.put('/:id', protect, adminOnly, uploadFurnitureImages, furnitureController.updateFurniture);
router.delete('/:id', protect, adminOnly, furnitureController.deleteFurniture);
router.delete('/:id/images/:publicId', protect, adminOnly, furnitureController.deleteFurnitureImage);
router.put('/:id/model', protect, adminOnly, uploadFurnitureModel, furnitureController.uploadModel);

// Nested reviews: /api/furniture/:furnitureId/reviews
router.get('/:furnitureId/reviews', reviewController.getReviews);
router.post(
  '/:furnitureId/reviews',
  protect,
  [body('rating').isInt({ min: 1, max: 5 }), body('comment').optional().trim().isLength({ max: 1000 })],
  validate,
  reviewController.createReview
);

module.exports = router;
