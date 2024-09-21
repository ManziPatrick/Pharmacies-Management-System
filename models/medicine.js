const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a medicine name'],
    },
    quantity: {
        type: Number,
        required: [true, 'Please provide a quantity'],
        min: [0, 'Quantity cannot be negative'],
    },
    price: {
        type: Number,
        required: [true, 'Please provide a price'],
        min: [0, 'Price cannot be negative'],
    },
    expiryDate: {
        type: Date,
        required: [true, 'Please provide an expiry date'],
    },
    stockThreshold: {
        type: Number,
        default: 10, // Example: alert if stock falls below 10 units
    },
    pharmacyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    },
    lastPriceUpdate: {
        type: Date,
        default: Date.now,  // Tracks the last time the price was updated
    },
});

// Middleware for price updates - Ensures uniform pricing across pharmacies
medicineSchema.pre('save', async function (next) {
    if (this.isModified('price')) {
        // Logic to sync the price across all pharmacies with this medicine
        await Medicine.updateMany(
            { name: this.name },  // Update all medicines with the same name
            { price: this.price, lastPriceUpdate: Date.now() }
        );
    }
    next();
});

const Medicine = mongoose.model('Medicine', medicineSchema);

module.exports = Medicine;
