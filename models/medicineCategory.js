const mongoose = require('mongoose');


const medicineCategorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a category name'],
        unique: true,
        trim: true
    },
    description: {
        type: String,
        default: '',
        trim: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});


const MedicineCategory = mongoose.model('MedicineCategory', medicineCategorySchema);

module.exports = MedicineCategory;
