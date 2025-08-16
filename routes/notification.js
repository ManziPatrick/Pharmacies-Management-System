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

// Test endpoint to send a notification
router.post('/test', async (req, res) => {
    try {
        const { userId, message, type } = req.body;
        const io = req.io;
        
        if (!userId || !message) {
            return res.status(400).json({ message: 'userId and message are required' });
        }
        
        const notification = new Notification({
            userId,
            type: type || 'test',
            message,
            timestamp: new Date(),
            read: false
        });
        
        await notification.save();
        
        // Emit to specific user
        io.to(`user_${userId}`).emit('notification', notification);
        io.to(`pharmacy_${userId}`).emit('notification', notification);
        
        res.status(200).json({ 
            message: 'Test notification sent successfully',
            notification 
        });
    } catch (error) {
        console.error('Error sending test notification:', error);
        res.status(500).json({ message: 'Error sending test notification' });
    }
});

// Get online users
router.get('/online-users', (req, res) => {
    try {
        const io = req.io;
        const onlineUsers = [];
        
        // Get all connected sockets
        const sockets = io.sockets.sockets;
        sockets.forEach((socket) => {
            if (socket.userId && socket.userInfo) {
                onlineUsers.push({
                    userId: socket.userId,
                    pharmacyName: socket.userInfo.pharmacyName,
                    ownerName: socket.userInfo.ownerName,
                    email: socket.userInfo.email,
                    socketId: socket.id,
                    connectedAt: socket.connectedAt || new Date()
                });
            }
        });
        
        res.status(200).json({
            count: onlineUsers.length,
            users: onlineUsers
        });
    } catch (error) {
        console.error('Error getting online users:', error);
        res.status(500).json({ message: 'Error getting online users' });
    }
});

module.exports = router;
