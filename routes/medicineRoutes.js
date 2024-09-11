const express = require('express');
const router = express.Router();
const medicineController = require('../controllers/medicineController');

router.get('/', medicineController.searchMedicines);

router.get('/', medicineController.getMedicines);

router.post('/', medicineController.createMedicine);

router.put('/:id', medicineController.updateMedicineById);

module.exports = router; 

