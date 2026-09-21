const express = require('express');
const { body } = require('express-validator');
const reviewController = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validateMiddleware');

const router = express.Router();

router.use(protect);

router.put(
  '/:id',
  [body('rating').optional().isInt({ min: 1, max: 5 }), body('comment').optional().trim().isLength({ max: 1000 })],
  validate,
  reviewController.updateReview
);
router.delete('/:id', reviewController.deleteReview);

module.exports = router;
