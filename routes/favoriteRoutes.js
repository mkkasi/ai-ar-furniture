const express = require('express');
const { body } = require('express-validator');
const favoriteController = require('../controllers/favoriteController');
const { protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validateMiddleware');

const router = express.Router();

router.use(protect);

router.get('/', favoriteController.getFavorites);
router.post('/', [body('furnitureId').isMongoId()], validate, favoriteController.addFavorite);
router.delete('/:furnitureId', favoriteController.removeFavorite);

module.exports = router;
