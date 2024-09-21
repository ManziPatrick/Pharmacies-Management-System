const Medicine = require('../models/medicine');
const { notifyPharmacists } = require('../services/pushService');

// Create Medicine and Send Notifications if Stock Low or Expiry Near
exports.createMedicine = async (req, res) => {
    const { name, quantity, price, expiryDate } = req.body;
    const pharmacyId = req.user._id;

    const newMedicine = new Medicine({
        name,
        quantity,
        price,
        expiryDate,
        pharmacyId,
    });

    try {
        const savedMedicine = await newMedicine.save();

        // Notify pharmacists if stock is low
        if (quantity < 5) {
            notifyPharmacists({
                title: 'Stock Alert',
                message: `${name} is running low on stock at your pharmacy.`,
            });
        }

        // Notify pharmacists if expiry date is near (within 30 days)
        const expiryThreshold = new Date();
        expiryThreshold.setDate(expiryThreshold.getDate() + 30);
        if (new Date(expiryDate) < expiryThreshold) {
            notifyPharmacists({
                title: 'Expiry Alert',
                message: `${name} is expiring soon at your pharmacy.`,
            });
        }

        res.status(201).json(savedMedicine);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Update Medicine and Send Notifications if Stock Low or Expiry Near
exports.updateMedicine = async (req, res) => {
    const { name, quantity, price, expiryDate } = req.body;
    const { id } = req.params;  // Medicine ID

    try {
        const updatedMedicine = await Medicine.findByIdAndUpdate(id, {
            name, quantity, price, expiryDate
        }, { new: true });

        // Notify pharmacists if stock is low
        if (quantity < 5) {
            notifyPharmacists({
                title: 'Stock Alert',
                message: `${name} is running low on stock at your pharmacy.`,
            });
        }

        // Notify pharmacists if expiry date is near (within 30 days)
        const expiryThreshold = new Date();
        expiryThreshold.setDate(expiryThreshold.getDate() + 30);
        if (new Date(expiryDate) < expiryThreshold) {
            notifyPharmacists({
                title: 'Expiry Alert',
                message: `${name} is expiring soon at your pharmacy.`,
            });
        }

        res.status(200).json(updatedMedicine);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Get all medicines (optional for fetching all medicines)
exports.getMedicines = async (req, res) => {
    try {
        const medicines = await Medicine.find({ pharmacyId: req.user._id });
        res.status(200).json(medicines);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete medicine
exports.deleteMedicine = async (req, res) => {
    const { id } = req.params;  // Medicine ID

    try {
        await Medicine.findByIdAndDelete(id);
        res.status(204).json({ message: 'Medicine deleted successfully' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};


exports.searchMedicines = async (req, res) => {
    const { searchTerm, expiryDate } = req.query; // No pharmacyId in the query
    
    try {
        const query = {};

        // Add search term filter (case-insensitive)
        if (searchTerm) {
            query.name = { $regex: searchTerm, $options: 'i' }; // Case-insensitive search
        }

        // Add expiry date filter
        if (expiryDate) {
            const expiry = new Date(expiryDate);
            if (!isNaN(expiry.getTime())) {
                query.expiryDate = { $gte: expiry }; // Medicines expiring after or on the specified date
            } else {
                return res.status(400).json({ message: 'Invalid expiry date format' });
            }
        }

        // Fetch medicines based on the constructed query
        const medicines = await Medicine.find(query).populate('pharmacyId', 'pharmacyName'); // Fetch all medicines
        res.status(200).json(medicines);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


exports.getAllMedicines = async (req, res) => {
    try {
        const medicines = await Medicine.find(); // Fetch all medicines
        res.status(200).json(medicines);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};