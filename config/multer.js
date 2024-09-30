// config/multer.js
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('./cloudinary');

const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'medicines', 
        allowedFormats: ['jpeg', 'png', 'jpg'],
        public_id: (req, file) => `${Date.now()}-${file.originalname}`
    }
});

const upload = multer({ storage });

module.exports = upload;
