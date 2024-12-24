const User = require('../models/user');
const generateToken = require('../utils/generateToken');
const bcrypt = require('bcryptjs');
const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    
    const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
        
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

exports.getNearbyPharmacies = async (req, res) => {
    try {
        const { lat, lng, maxDistance = 100 } = req.query; // maxDistance in km

        if (!lat || !lng) {
            return res.status(400).json({ message: 'Latitude and longitude are required' });
        }

        const pharmacies = await User.find({
            latitude: { $exists: true },
            longitude: { $exists: true }
        });

        const userLat = parseFloat(lat);
        const userLng = parseFloat(lng);
        const maxDist = parseFloat(maxDistance);

        const nearbyPharmacies = pharmacies
            .map(pharmacy => {
                const distance = calculateDistance(userLat, userLng, pharmacy.latitude, pharmacy.longitude);
                return { id: pharmacy._id, name: pharmacy.pharmacyName, distance }; // Include id, name, and distance
            })
            .filter(pharmacy => pharmacy.distance <= maxDist) 
            .sort((a, b) => a.distance - b.distance); 

        const limitedPharmacies = nearbyPharmacies.slice(0, 20).map(pharmacy => ({ id: pharmacy.id, name: pharmacy.name })); // Return only ids and names

        res.json(limitedPharmacies);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching nearby pharmacies', error: error.message });
    }
};
exports.registerPharmacy = async (req, res) => {
    let { pharmacyName, location, phoneNumber, ownerName, licenseNumber, email, password, latitude, longitude } = req.body;

    
    

    try {
        console.log('Attempting to register user with email:', email);

        
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'Pharmacy already registered' });
        }

        
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
        const isMatch = await user.matchPassword(password);  // Use the matchPassword method

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


exports.getUserById = async (req, res) => {
    const { id } = req.params;

    try {
       
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

