const express = require('express');
const adminController = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect, adminOnly);

router.get('/stats', adminController.getDashboardStats);
router.get('/users', adminController.listUsers);
router.put('/users/:id/disable', adminController.toggleUserDisabled);
router.get('/saved-designs', adminController.listAllSavedDesigns);
router.get('/reviews', adminController.listAllReviews);
router.delete('/reviews/:id', adminController.deleteAnyReview);

module.exports = router;
