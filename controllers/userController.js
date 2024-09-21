const User = require('../models/user');
const generateToken = require('../utils/generateToken');
const bcrypt = require('bcryptjs');

// Register a pharmacy
exports.registerPharmacy = async (req, res) => {
    const { pharmacyName, location, phoneNumber, ownerName, licenseNumber, email, password, latitude, longitude } = req.body;

    try {
        console.log('Attempting to register user with email:', email);

        // Check if user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'Pharmacy already registered' });
        }

        // Create new pharmacy (user)
        const user = await User.create({
            pharmacyName,
            location,
            phoneNumber,
            ownerName,
            licenseNumber,
            email,
            password,
            latitude,
            longitude
        });

        console.log('User created:', user);

        if (user) {
            res.status(201).json({
                _id: user._id,
                pharmacyName: user.pharmacyName,
                email: user.email,
                token: generateToken(user._id)
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        console.error('Error during registration:', error.message);
        res.status(500).json({ message: error.message });
    }
};

// Login a pharmacy
exports.loginPharmacy = async (req, res) => {
    const { email, password } = req.body;
    
    console.log('Attempting to login with email:', email);

    try {
        // Fetch user by email
        const user = await User.findOne({ email });

        console.log('User found:', user ? 'Yes' : 'No');

        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Check if password matches
        const isMatch = await bcrypt.compare(password, user.password);

        if (isMatch) {
            res.json({
                _id: user._id,
                pharmacyName: user.pharmacyName,
                email: user.email,
                token: generateToken(user)
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        console.error('Login error:', error.message);
        res.status(500).json({ message: 'Server error during login' });
    }
};

// Get user (pharmacy) by ID, separating requesting and requested data
exports.getUserById = async (req, res) => {
    const { id } = req.params;

    try {
        // Find the pharmacy by ID and populate the medicine details in requests
        const user = await User.findById(id)
            .populate({
                path: 'requestsInitiated.medicine_id',
                select: 'name price quantity'
            })
            .populate({
                path: 'requestsReceived.medicine_id',
                select: 'name price quantity'
            });

        if (!user) {
            return res.status(404).json({ message: 'Pharmacy not found' });
        }

        // Separate the requests into two categories
        const requesting = user.requestsInitiated;  // Requests initiated by this pharmacy
        const requested = user.requestsReceived;  

        res.json({
            _id: user._id,
            pharmacyName: user.pharmacyName,
            email: user.email,
            location: user.location,
            phoneNumber: user.phoneNumber,
            ownerName: user.ownerName,
            licenseNumber: user.licenseNumber,
            latitude: user.latitude,
            longitude: user.longitude,
            createdAt: user.createdAt,
            requestsInitiated: requesting,  
            requestsReceived: requested,   
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// Get all pharmacies
exports.getAllUsers = async (req, res) => {
    try {
        // Retrieve all users
        const users = await User.find({})
            .select('-password') // Exclude password from the returned data
            .populate({
                path: 'requestsInitiated.medicine_id',
                select: 'name price quantity'
            })
            .populate({
                path: 'requestsReceived.medicine_id',
                select: 'name price quantity'
            });

        if (!users) {
            return res.status(404).json({ message: 'No pharmacies found' });
        }

        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
};

