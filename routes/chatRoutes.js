const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');

router.post('/send', chatController.sendMessage);
router.get('/history/:pharmacyId', chatController.getChatHistory);
router.get('/pharmacy/:pharmacyId', protect, chatController.getPharmacyChats);

module.exports = router;