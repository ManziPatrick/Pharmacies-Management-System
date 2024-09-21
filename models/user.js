const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Define the schema for requests
const requestSchema = new mongoose.Schema({
    medicine_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Medicine', // Reference to the Medicine model
        required: true
    },
    fulfilling_pharmacy_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Reference to the pharmacy fulfilling the request
        required: true
    },
    requesting_pharmacy_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Reference to the pharmacy requesting the medicine
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
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Define the main user (pharmacy) schema
const userSchema = new mongoose.Schema({
    pharmacyName: {
        type: String,
        required: true,
    },
    location: {
        type: String,
        required: true,
    },
    phoneNumber: {
        type: String,
        required: true,
        unique: true,
    },
    ownerName: {
        type: String,
        required: true,
    },
    licenseNumber: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    latitude: {
        type: Number,
        default: null,
    },
    longitude: {
        type: Number,
        default: null,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    // Arrays for requests
    requestsInitiated: [requestSchema], // Requests initiated by this pharmacy
    requestsReceived: [requestSchema] // Requests received by this pharmacy
});

// Hash the password before saving the user
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Method to match password
userSchema.methods.matchPassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
