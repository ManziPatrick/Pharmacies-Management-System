const express = require('express');
const router = express.Router();
const medicineController = require('../controllers/medicineController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../config/multer');

router.post('/', protect, upload.array('images', 5), (req, res, next) => {
    console.log('Request body:', req.body);
    console.log('Uploaded files:', req.files);

    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: 'No files were uploaded.' });
    }

    next();
}, medicineController.createMedicine);

router.put('/:id', protect, authorize('pharmacist'), medicineController.updateMedicine);
router.get('/one/:id', medicineController.getMedicineById);
router.get('/', medicineController.getMedicines);
router.delete('/:id', protect, authorize('pharmacist'), medicineController.deleteMedicine);
router.get('/search', medicineController.searchMedicines);
router.get('/all', medicineController.getAllMedicines);
router.get('/by-category', medicineController.getMedicinesByCategories);
router.get('/pharmacies/:pharmacyId/medicines', medicineController.getAllMedicinesByPharmacyId);
router.get('/category/:categoryId', medicineController.getMedicinesByCategoryId);

module.exports = router;
