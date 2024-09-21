const express = require('express');
const router = express.Router();
const medicineController = require('../controllers/medicineController');
const protect = require('../middleware/authMiddleware');  // Ensure the path is correct

// Create a new medicine
router.post('/', protect, medicineController.createMedicine);

// Update an existing medicine by ID
router.put('/:id', protect, medicineController.updateMedicine);

router.get('/', protect, medicineController.getMedicines);
router.get('/all', medicineController.getAllMedicines);

router.delete('/:id', protect, medicineController.deleteMedicine);
router.get('/search', protect, medicineController.searchMedicines);

module.exports = router;
