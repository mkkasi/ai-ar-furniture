const express = require('express');
const { body } = require('express-validator');
const savedDesignController = require('../controllers/savedDesignController');
const { protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validateMiddleware');
const { uploadDesignScreenshot } = require('../middleware/uploadMiddleware');

const router = express.Router();

// Public shared-design view does not require auth
router.get('/shared/:shareToken', savedDesignController.getSharedDesign);

router.use(protect);

router.get('/', savedDesignController.getSavedDesigns);
router.post(
  '/',
  uploadDesignScreenshot,
  [body('name').trim().notEmpty().withMessage('Design name is required')],
  validate,
  savedDesignController.createSavedDesign
);
router.get('/:id', savedDesignController.getSavedDesign);
router.put('/:id', uploadDesignScreenshot, savedDesignController.updateSavedDesign);
router.delete('/:id', savedDesignController.deleteSavedDesign);
router.post('/:id/share', savedDesignController.shareSavedDesign);

module.exports = router;
