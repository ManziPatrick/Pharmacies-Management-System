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
app.use('/api/categories',categoryRoutes);
app.use('/api/requests', requestRoutes); 
app.use('/api/notify', notify); 

io.on('connection', (socket) => {
  console.log('A user connected: ', socket.id);

  socket.on('disconnect', () => {
    console.log('User disconnected: ', socket.id);
  });
});

process.on('SIGINT', () => {
  console.log('Shutting down server...');
  server.close(() => {
    console.log('Server closed.');
    process.exit(0);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
