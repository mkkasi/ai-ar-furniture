const express = require('express');
const { body } = require('express-validator');
const notificationController = require('../controllers/notificationController');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const validate = require('../middleware/validateMiddleware');

const router = express.Router();

router.use(protect);

router.get('/', notificationController.getNotifications);
router.put('/:id/read', notificationController.markAsRead);

router.post(
  '/',
  adminOnly,
  [body('title').trim().notEmpty(), body('body').trim().notEmpty()],
  validate,
  notificationController.createNotification
);

module.exports = router;
