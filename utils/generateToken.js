const jwt = require('jsonwebtoken');

const generateToken = (user) => {
    // Handle both cases: when user is an object or just an ID
    let payload;
    if (typeof user === 'object' && user._id) {
        // User object passed
        payload = {
            _id: user._id,
            id: user._id, // For backward compatibility
            pharmacyName: user.pharmacyName,
            email: user.email,
            name: user.name || user.pharmacyName,
            ownerName: user.ownerName
        };
    } else {
        // Just ID passed (for backward compatibility)
        payload = {
            _id: user,
            id: user
        };
    }
    
    return jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

module.exports = generateToken;
