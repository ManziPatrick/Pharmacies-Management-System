const express = require('express');
const router = express.Router();
const  registerPharmacy = require('../controllers/userController'); // Ensure proper import
const protect = require('../middleware/authMiddleware');

router.post('/register', registerPharmacy.registerPharmacy);

router.post('/login', registerPharmacy.loginPharmacy);
router.get('/:id', registerPharmacy.getUserById);
router.get('/', protect, registerPharmacy.getAllUsers);
module.exports = router;
