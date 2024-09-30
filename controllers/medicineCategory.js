const MedicineCategory = require('../models/medicineCategory');
const Medicine = require('../models/medicine');

exports.createCategory = async (req, res) => {
    const { name, description } = req.body;

    try {
        // Validate input
        if (!name) {
            return res.status(400).json({ message: 'Category name is required' });
        }

        // Check if category already exists
        const existingCategory = await MedicineCategory.findOne({ name: name.trim() });
        if (existingCategory) {
            return res.status(400).json({ message: 'Category already exists' });
        }

        // Create and save new category
        const category = new MedicineCategory({ name: name.trim(), description });
        const savedCategory = await category.save();
        res.status(201).json(savedCategory);
    } catch (error) {
        console.error('Error creating category:', error);
        res.status(500).json({ message: 'Server error while creating category.' });
    }
};

exports.getAllCategories = async (req, res) => {
    try {
        const categories = await MedicineCategory.find().sort({ name: 1 });
        res.status(200).json(categories);
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ message: 'Server error while fetching categories.' });
    }
};

exports.getCategoryById = async (req, res) => {
    const { id } = req.params;

    try {
        const category = await MedicineCategory.findById(id);
        if (!category) {
            return res.status(404).json({ message: 'Category not found.' });
        }
        res.status(200).json(category);
    } catch (error) {
        console.error('Error fetching category:', error);
        res.status(500).json({ message: 'Server error while fetching category.' });
    }
};

exports.updateCategory = async (req, res) => {
    const { id } = req.params;
    const { name, description } = req.body;

    try {
        const category = await MedicineCategory.findById(id);
        if (!category) {
            return res.status(404).json({ message: 'Category not found.' });
        }

        if (name) category.name = name.trim();
        if (description !== undefined) category.description = description;

        const updatedCategory = await category.save();
        res.status(200).json(updatedCategory);
    } catch (error) {
        console.error('Error updating category:', error);
        res.status(500).json({ message: 'Server error while updating category.' });
    }
};

exports.deleteCategory = async (req, res) => {
    const { id } = req.params;

    try {
        const category = await MedicineCategory.findById(id);
        if (!category) {
            return res.status(404).json({ message: 'Category not found.' });
        }

        const associatedMedicines = await Medicine.findOne({ category: id });
        if (associatedMedicines) {
            return res.status(400).json({ message: 'Cannot delete category with associated medicines.' });
        }

        await MedicineCategory.findByIdAndDelete(id);
        res.status(200).json({ message: 'Category deleted successfully.' });
    } catch (error) {
        console.error('Error deleting category:', error);
        res.status(500).json({ message: 'Server error while deleting category.' });
    }
};