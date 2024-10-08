const Chat = require('../models/chat');
const cloudinary = require('../config/cloudinary');
const crypto = require('crypto');

const generateAnonymousId = (req) => {
  const userAgent = req.headers['user-agent'];
  const ip = req.ip;
  return crypto.createHash('md5').update(userAgent + ip).digest('hex');
};

exports.sendMessage = async (req, res) => {
  try {
    const { pharmacyId, message, image } = req.body;
    let imageUrl;

    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image, { upload_preset: 'chat_images' });
      imageUrl = uploadResponse.secure_url;
    }

    const isAnonymous = !req.user;
    const sender = isAnonymous ? generateAnonymousId(req) : req.user._id.toString();

    const newMessage = await Chat.create({
      sender,
      receiver: pharmacyId,
      message,
      image: imageUrl,
      isAnonymous
    });

    res.status(201).json(newMessage);
  } catch (error) {
    res.status(500).json({ message: 'Error sending message', error: error.message });
  }
};

exports.getChatHistory = async (req, res) => {
  try {
    const { pharmacyId } = req.params;
    const sender = req.user ? req.user._id.toString() : generateAnonymousId(req);

    if (!pharmacyId) {
      return res.status(400).json({ message: 'Pharmacy ID is required.' });
    }

    const chatHistory = await Chat.find({
      $or: [
        { sender: sender, receiver: pharmacyId },
        { sender: pharmacyId, receiver: sender }
      ]
    }).sort('createdAt');

    res.json(chatHistory);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching chat history', error: error.message });
  }
};

exports.getPharmacyChats = async (req, res) => {
  try {
    const { pharmacyId } = req.params;

    if (!pharmacyId) {
      return res.status(400).json({ message: 'Pharmacy ID is required.' });
    }

    const chats = await Chat.aggregate([
      {
        $match: {
          $or: [{ sender: pharmacyId }, { receiver: pharmacyId }]
        }
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ['$sender', pharmacyId] },
              '$receiver',
              '$sender'
            ]
          },
          lastMessage: { $last: '$$ROOT' }
        }
      },
      {
        $sort: { 'lastMessage.createdAt': -1 }
      }
    ]);

    res.json(chats);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching pharmacy chats', error: error.message });
  }
};