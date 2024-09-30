const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/medicineCategory');
const { protect } = require('../middleware/authMiddleware'); 

router.post('/', protect, categoryController.createCategory);

router.get('/', categoryController.getAllCategories);

router.get('/:id', categoryController.getCategoryById);

router.put('/:id', categoryController.updateCategory);

router.delete('/:id', categoryController.deleteCategory);


module.exports = router;
