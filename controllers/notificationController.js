const Subscription = require('../models/subscription');
const Notification = require('../models/Notification');
const User = require('../models/user');
const jwt = require('jsonwebtoken');


const getUserIdFromToken = (req) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) return null;
    const token = authHeader.split(' ')[1];
    if (!token) return null;
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return decoded.id; 
    } catch (error) {
        return null;
    }
};

exports.subscribeToNotifications = async (req, res) => {
    const userId = getUserIdFromToken(req);
    if (!userId) {
        return res.status(403).json({ message: 'Invalid or missing token' });
    }

    const { endpoint, keys } = req.body;

    const newSubscription = new Subscription({
        pharmacistId: userId,
        endpoint,
        keys
    });

    try {
        await newSubscription.save();
        res.status(201).json({ message: 'Subscription saved successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Unsubscribe from notifications
exports.unsubscribeFromNotifications = async (req, res) => {
    const userId = getUserIdFromToken(req);
    if (!userId) {
        return res.status(403).json({ message: 'Invalid or missing token' });
    }

    try {
        await Subscription.findOneAndDelete({ pharmacistId: userId });
        res.json({ message: 'Unsubscribed successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Notify about a new request
exports.notifyNewRequest = async (request, io) => {
    try {
        const notification = new Notification({
            userId: request.requesting_pharmacy_id,
            type: 'new_request',
            message: `New request for ${request.medicine_id.name}`,
            requestId: request._id,
            timestamp: new Date(),
            read: false
        });
        await notification.save();

        // Emit the notification via Socket.io to the specific user
        io.to(request.requesting_pharmacy_id.toString()).emit('new_request', notification);
    } catch (error) {
        console.error('Error notifying new request:', error);
    }
};

// Notify about a status update
exports.notifyStatusUpdate = async (request, io) => {
    try {
        const notification = new Notification({
            userId: request.requesting_pharmacy_id,
            type: 'status_update',
            message: `Request ${request._id} status updated to ${request.status}`,
            requestId: request._id,
            timestamp: new Date(),
            read: false
        });
        await notification.save();

        // Emit the notification via Socket.io to the specific user
        io.to(request.requesting_pharmacy_id.toString()).emit('status_update', notification);
    } catch (error) {
        console.error('Error notifying status update:', error);
    }
};

// Notify about a new medicine addition
exports.notifyNewMedicine = async (medicine, io) => {
    try {
        const users = await User.find(); // Fetch all users to notify
        const notifications = users.map(user => ({
            userId: user._id,
            type: 'new_medicine',
            message: `New medicine added: ${medicine.name}`,
            medicineId: medicine._id,
            timestamp: new Date(),
            read: false
        }));
        console.log('Creating notification for userId:', request.requesting_pharmacy_id);
        console.log('Notification being created:', notification);


        await Notification.insertMany(notifications);
        

        // Emit the notification via Socket.io to each user
        notifications.forEach(notification => {
            io.to(notification.userId.toString()).emit('new_medicine', notification);
        });
       

    } catch (error) {
        console.error('Error notifying new medicine:', error);
    }
};

// Fetch notifications for a user
exports.getNotifications = async (req, res) => {
    const userId = req.query.userId;
    console.log('Fetching notifications for userId:', userId);

    if (!userId) {
        return res.status(403).json({ message: 'No userId provided' });
    }

    try {
        const notifications = await Notification.find({ userId })
            .sort({ timestamp: -1 })
            .limit(100); // Adjust the limit as needed
        res.status(200).json(notifications);
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Mark a notification as read
exports.markAsRead = async (req, res) => {
    const { notificationId } = req.body;
    const userId = getUserIdFromToken(req);

    if (!userId) {
        return res.status(403).json({ message: 'Invalid or missing token' });
    }

    if (!notificationId) {
        return res.status(400).json({ message: 'No notificationId provided' });
    }

    try {
        const notification = await Notification.findById(notificationId);
        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        // Verify that the notification belongs to the user
        if (notification.userId.toString() !== userId) {
            return res.status(403).json({ message: 'Unauthorized to modify this notification' });
        }

        notification.read = true;
        await notification.save();

        res.json({ message: 'Notification marked as read' });
    } catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
