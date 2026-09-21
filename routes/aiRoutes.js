const express = require('express');
const aiController = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');
const { uploadRoomPhoto, uploadVisualSearchPhoto } = require('../middleware/uploadMiddleware');

const router = express.Router();

router.use(protect);

router.post('/recommendations', aiController.getRecommendations);
router.get('/match/:furnitureId', aiController.getMatchingFurniture);
router.post('/interior-design', uploadRoomPhoto, aiController.analyzeRoomDesign);
router.post('/visual-search', uploadVisualSearchPhoto, aiController.visualSearch);
router.post('/chat', aiController.chatWithAssistant);
router.get('/chat/history', aiController.getChatHistory);
router.delete('/chat/history', aiController.clearChatHistory);

module.exports = router;
