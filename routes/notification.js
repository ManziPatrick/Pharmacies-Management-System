const express = require('express');
const router = express.Router();
const {
    subscribeToNotifications,
    unsubscribeFromNotifications,
    notifyNewRequest,
    notifyStatusUpdate,
    notifyNewMedicine,
    getNotifications,
    markAsRead
} = require('../controllers/notificationController');

router.post('/subscribe', subscribeToNotifications);

router.delete('/unsubscribe', unsubscribeFromNotifications);


router.post('/notify', async (req, res) => {
    const { type, data } = req.body;

    try {
     
        const io = req.io;

        switch(type) {
            case 'new_request':
                await notifyNewRequest(data, io);
                break;
            case 'status_update':
                await notifyStatusUpdate(data, io);
                break;
            case 'new_medicine':
                await notifyNewMedicine(data, io);
                break;
            default:
                return res.status(400).json({ message: 'Invalid notification type' });
        }

        res.status(200).json({ message: 'Notification sent successfully' });
    } catch (error) {
        console.error('Error sending notification:', error);
        res.status(500).json({ message: 'Error sending notification' });
    }
});


router.get('/notifications', getNotifications);


router.post('/mark-as-read', markAsRead);

module.exports = router;
