const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a medicine name'],
        trim: true
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MedicineCategory',
        required: [true, 'Please provide a category for the medicine']
    },
    quantity: {
        type: Number,
        required: [true, 'Please provide a quantity'],
        min: [0, 'Quantity cannot be negative']
    },
    price: {
        type: Number,
        required: [true, 'Please provide a price'],
        min: [0, 'Price cannot be negative']
    },
    expiryDate: {
        type: Date,
        required: [true, 'Please provide an expiry date']
    },
    stockThreshold: {
        type: Number,
        default: 10,
        min: [0, 'Stock threshold cannot be negative']
    },
    pharmacyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    description: {
        type: String,
        required: [true, 'Please provide a description for the medicine'],
        trim: true
    },
    images: [{ type: String }],
    createdAt: { 
        type: Date, 
        default: Date.now 
    },
    lastPriceUpdate: {
        type: Date,
        default: Date.now,  
    },
});
medicineSchema.pre('save', async function (next) {
    if (this.isModified('price')) {
        
        await this.constructor.updateMany(
            { name: this.name },  
            { price: this.price, lastPriceUpdate: Date.now() }
        );
    }
    next();
});

const Medicine = mongoose.model('Medicine', medicineSchema);

module.exports = Medicine;
