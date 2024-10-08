const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');

router.post('/send', chatController.sendMessage);
router.get('/history/:senderId/:pharmacyId',protect , chatController.getChatHistory);

module.exports = router;