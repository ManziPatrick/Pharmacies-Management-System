const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
    medicine_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Medicine',
        required: true
    },
    requesting_pharmacy_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',  
        required: true
    },
    fulfilling_pharmacy_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Fulfilled', 'Rejected'],
        default: 'Pending'
    },
    commission: {
        type: Number,
        required: true,
        min: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Request = mongoose.model('Request', requestSchema);
module.exports = Request;
