const express = require('express');
const router = express.Router();
const { 
    registerPharmacy, 
    loginPharmacy, 
    getUserById, 
    getAllUsers, 
    getNearbyPharmacies
} = require('../controllers/userController');
router.get('/nearby', getNearbyPharmacies);
router.post('/register', registerPharmacy);

router.post('/login', loginPharmacy);

router.get('/:id', getUserById);


router.get('/', getAllUsers);

module.exports = router;