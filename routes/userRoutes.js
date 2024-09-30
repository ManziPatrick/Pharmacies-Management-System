const express = require('express');
const router = express.Router();
const { 
    registerPharmacy, 
    loginPharmacy, 
    getUserById, 
    getAllUsers 
} = require('../controllers/userController');

// Register a new pharmacy
router.post('/register', registerPharmacy);

router.post('/login', loginPharmacy);

// Get user by ID
router.get('/:id', getUserById);


router.get('/', getAllUsers);

module.exports = router;