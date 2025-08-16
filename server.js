const express = require('express');
const bodyParser = require('body-parser');
const chatRoutes = require('./routes/chatRoutes');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const medicineRoutes = require('./routes/medicineRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const userRoutes = require('./routes/userRoutes');
const requestRoutes = require('./routes/requestRoutes');
const contactUs = require('./routes/contactus')
const notify = require('./routes/notification');
const http = require('http');
const { Server } = require('socket.io');
const morgan = require('morgan');

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(morgan('dev')); 

// Add home route
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Pharmacy API</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 20px;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            background-color: #f5f5f5;
          }
          .container {
            max-width: 800px;
            background-color: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
          }
          h1 {
            color: #333;
            margin-bottom: 20px;
          }
          p {
            color: #666;
            margin-bottom: 15px;
          }
          .endpoints {
            margin-top: 20px;
          }
          .endpoint {
            background-color: #f8f9fa;
            padding: 10px;
            margin-bottom: 10px;
            border-radius: 5px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>🏥 Pharmacy API</h1>
          <p>Welcome to the Pharmacy Management System API. The server is up and running.</p>
          <p>Server Status: ✅ Active</p>
          
          <div class="endpoints">
            <h2>Available Endpoints:</h2>
            <div class="endpoint">/api/medicines - Manage medicine inventory</div>
            <div class="endpoint">/api/users - User management</div>
            <div class="endpoint">/api/categories - Medicine categories</div>
            <div class="endpoint">/api/requests - Handle medicine requests</div>
            <div class="endpoint">/api/chat - Real-time chat functionality</div>
            <div class="endpoint">/api/notify - Notification system</div>
          </div>
          
          <p>For more information, please refer to the API documentation.</p>
        </div>
      </body>
    </html>
  `);
});


const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

// Attach io instance to every request
app.use((req, res, next) => {
  req.io = io;
  next();
});


const Chat = require('./models/chat');
const Notification = require('./models/Notification');

// Track online pharmacies with user info
const onlinePharmacies = new Map(); // Changed to Map to store user info

io.on('connection', (socket) => {
  console.log('A user connected: ', socket.id);
  socket.connectedAt = new Date();

  // Handle user authentication and room joining
  socket.on('authenticate', async (data) => {
    if (data.userId) {
      socket.userId = data.userId;
      socket.join(`user_${data.userId}`);
      socket.join(`pharmacy_${data.userId}`); // Also join as pharmacy
      
      try {
        // Fetch user info from database
        const User = require('./models/user');
        const userInfo = await User.findById(data.userId).select('pharmacyName ownerName email');
        
        if (userInfo) {
          const userOnlineData = {
            userId: data.userId,
            pharmacyName: userInfo.pharmacyName,
            ownerName: userInfo.ownerName,
            email: userInfo.email,
            socketId: socket.id,
            connectedAt: socket.connectedAt
          };
          
          onlinePharmacies.set(data.userId, userOnlineData);
          socket.userInfo = userOnlineData;
          
          console.log(`User ${userInfo.pharmacyName} (${data.userId}) authenticated and joined rooms at ${socket.connectedAt}`);
          
          // Notify all clients of the current online pharmacies
          const onlineUsersArray = Array.from(onlinePharmacies.values());
          io.emit('onlinePharmacies', onlineUsersArray);
          
          // Broadcast user online status
          socket.broadcast.emit('userOnline', userOnlineData);
        } else {
          console.error(`User not found: ${data.userId}`);
        }
      } catch (error) {
        console.error('Error fetching user info:', error);
        // Fallback to basic tracking
        onlinePharmacies.set(data.userId, {
          userId: data.userId,
          pharmacyName: `User ${data.userId.substring(0, 8)}...`,
          socketId: socket.id,
          connectedAt: socket.connectedAt
        });
      }
      
      try {
        // Query unread counts from DB
        const [unreadMessagesCount, unreadNotificationsCount] = await Promise.all([
          Chat.countDocuments({ receiver: data.userId, read: false }),
          Notification.countDocuments({ userId: data.userId, read: false })
        ]);
        
        // Send unread counts to user
        socket.emit('unreadCounts', {
          messages: unreadMessagesCount,
          notifications: unreadNotificationsCount
        });
        
        console.log(`Sent unread counts to ${data.userId}: messages=${unreadMessagesCount}, notifications=${unreadNotificationsCount}`);
      } catch (error) {
        console.error('Error fetching unread counts:', error);
      }
    }
  });

  // Handle sending messages
  socket.on('sendMessage', async (data) => {
    try {
      console.log('Received message:', data);
      if (data.receiverId) {
        // Save message as unread in DB
        await Chat.create({
          sender: data.senderId || socket.userId,
          receiver: data.receiverId,
          message: data.message,
          image: data.image,
          isAnonymous: data.isAnonymous || false,
          read: false
        });
        // Emit to specific pharmacy room
        socket.to(`pharmacy_${data.receiverId}`).emit('receiveMessage', data);
        socket.to(`user_${data.receiverId}`).emit('receiveMessage', data);
        socket.broadcast.emit('newMessage', data);
        // Query unread count from DB
        const unreadMessagesCount = await Chat.countDocuments({ receiver: data.receiverId, read: false });
        const unreadNotificationsCount = await Notification.countDocuments({ userId: data.receiverId, read: false });
        io.to(`user_${data.receiverId}`).emit('unreadCounts', {
          messages: unreadMessagesCount,
          notifications: unreadNotificationsCount
        });
      }
      socket.emit('messageConfirmed', { messageId: data._id, status: 'sent' });
    } catch (error) {
      console.error('Error handling sendMessage:', error);
      socket.emit('messageError', { error: 'Failed to send message' });
    }
  });

  // Mark messages as read (frontend should emit this event when user views messages)
  socket.on('markMessagesRead', async (userId) => {
    await Chat.updateMany({ receiver: userId, read: false }, { $set: { read: true } });
    const unreadNotificationsCount = await Notification.countDocuments({ userId: userId, read: false });
    io.to(`user_${userId}`).emit('unreadCounts', {
      messages: 0,
      notifications: unreadNotificationsCount
    });
  });

  // Handle notifications (simulate notification event)
  socket.on('sendNotification', async (data) => {
    if (data.receiverId) {
      const notification = await Notification.create({
        userId: data.receiverId,
        type: data.type || 'custom',
        message: data.message,
        requestId: data.requestId,
        medicineId: data.medicineId,
        read: false
      });
      
      // Emit to specific user rooms
      io.to(`user_${data.receiverId}`).emit('notification', notification);
      io.to(`pharmacy_${data.receiverId}`).emit('notification', notification);
      
      // Update unread counts
      const unreadMessagesCount = await Chat.countDocuments({ receiver: data.receiverId, read: false });
      const unreadNotificationsCount = await Notification.countDocuments({ userId: data.receiverId, read: false });
      io.to(`user_${data.receiverId}`).emit('unreadCounts', {
        messages: unreadMessagesCount,
        notifications: unreadNotificationsCount
      });
    }
  });

  // Broadcast notification to all users (for system-wide notifications)
  socket.on('broadcastNotification', async (data) => {
    try {
      const User = require('./models/user');
      const users = await User.find({}, '_id');
      
      const notifications = users.map(user => ({
        userId: user._id,
        type: data.type || 'system',
        message: data.message,
        requestId: data.requestId,
        medicineId: data.medicineId,
        read: false
      }));
      
      await Notification.insertMany(notifications);
      
      // Emit to all connected users
      notifications.forEach(notification => {
        io.to(`user_${notification.userId}`).emit('notification', notification);
        io.to(`pharmacy_${notification.userId}`).emit('notification', notification);
      });
      
      console.log(`Broadcasted notification to ${notifications.length} users`);
    } catch (error) {
      console.error('Error broadcasting notification:', error);
    }
  });

  // Mark notifications as read (frontend should emit this event when user views notifications)
  socket.on('markNotificationsRead', async (userId) => {
    await Notification.updateMany({ userId: userId, read: false }, { $set: { read: true } });
    const unreadMessagesCount = await Chat.countDocuments({ receiver: userId, read: false });
    io.to(`user_${userId}`).emit('unreadCounts', {
      messages: unreadMessagesCount,
      notifications: 0
    });
  });

  // ...existing code for chat, typing, disconnect, error...
  socket.on('joinChat', (room) => {
    try {
      socket.join(room);
      console.log(`Socket ${socket.id} joined room: ${room}`);
      socket.emit('joinedChat', { room, status: 'success' });
    } catch (error) {
      console.error('Error joining chat:', error);
      socket.emit('joinError', { error: 'Failed to join chat' });
    }
  });

  socket.on('pharmacyOnline', (pharmacyId) => {
    socket.broadcast.emit('pharmacyOnline', pharmacyId);
  });

  socket.on('pharmacyOffline', (pharmacyId) => {
    socket.broadcast.emit('pharmacyOffline', pharmacyId);
  });

  socket.on('typing', (data) => {
    socket.to(data.room).emit('userTyping', {
      userId: socket.userId,
      isTyping: data.isTyping
    });
  });

  socket.on('disconnect', (reason) => {
    console.log(`User disconnected: ${socket.id}, reason: ${reason}`);
    if (socket.userId) {
      const userInfo = onlinePharmacies.get(socket.userId);
      onlinePharmacies.delete(socket.userId);
      
      // Notify all clients of the updated online pharmacies
      const onlineUsersArray = Array.from(onlinePharmacies.values());
      io.emit('onlinePharmacies', onlineUsersArray);
      
      socket.broadcast.emit('pharmacyOffline', socket.userId);
      socket.broadcast.emit('userOffline', socket.userId);
      
      if (userInfo) {
        console.log(`User ${userInfo.pharmacyName} (${socket.userId}) disconnected`);
      }
    }
  });

  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });
});

app.use('/api/chat', chatRoutes);
app.use('/api/medicines', medicineRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/requests', requestRoutes); 
app.use('/api/notify', notify); 
app.use('/api/contactus', contactUs); 

process.on('SIGINT', () => {
  console.log('Shutting down server...');
  server.close(() => {
    console.log('Server closed.');
    process.exit(0);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));