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
    createdAt: { type: Date, default: Date.now },
});

const Medicine = mongoose.model('Medicine', medicineSchema);

module.exports = Medicine;
