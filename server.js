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

io.on('connection', (socket) => {
  console.log('A user connected: ', socket.id);

  socket.on('sendMessage', (data) => {
    io.to(data.receiverId).emit('receiveMessage', data);
  });

  socket.on('joinChat', (room) => {
    socket.join(room);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected: ', socket.id);
  });
});

app.use('/api/chat', chatRoutes);
app.use('/api/medicines', medicineRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/requests', requestRoutes); 
app.use('/api/notify', notify); 

process.on('SIGINT', () => {
  console.log('Shutting down server...');
  server.close(() => {
    console.log('Server closed.');
    process.exit(0);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));