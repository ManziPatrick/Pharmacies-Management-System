const express = require ('express');

const router = express.Router();
const ContactUs =require('../controllers/contactUs')

router.post('/',ContactUs.ContactMe)
router.get('/messages',ContactUs.getMessages)
module.exports =router;