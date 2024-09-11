const Medicine = require('../models/medicine');

// Fetch all medicines
exports.getMedicines = async (req, res) => {
    try {
        const medicines = await Medicine.find(); 
        res.json(medicines); 
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create a new medicine
exports.createMedicine = async (req, res) => {
    const { name, quantity, price, expiryDate } = req.body; 

    const newMedicine = new Medicine({
        name,
        quantity,
        price,
        expiryDate,
    });

    try {
       
        const savedMedicine = await newMedicine.save();
        res.status(201).json(savedMedicine); 
    } catch (error) {
        res.status(400).json({ message: error.message }); 
    }
};
exports.searchMedicines = async (req, res) => {
    const { searchTerm, expiryDate } = req.query;

    try {
        const query = {};

        if (searchTerm) {
            query.name = { $regex: searchTerm, $options: 'i' };
        }

        if (expiryDate) {
            const expiry = new Date(expiryDate);
            if (!isNaN(expiry.getTime())) {
                query.expiryDate = { $gte: expiry };
            }
        }

        const medicines = await Medicine.find(query);
        res.json(medicines);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};



// Update a specific medicine by ID
exports.updateMedicineById = async (req, res) => {
    const { id } = req.params;
    const { name, quantity, price, expiryDate } = req.body;

    try {
        // Build the update object dynamically based on what fields are provided
        const updateFields = {};

        if (name) {
            updateFields.name = name;
        }

        if (quantity !== undefined) {
            updateFields.quantity = quantity;
        }

        if (price !== undefined) {
            updateFields.price = price;
        }

        if (expiryDate) {
            updateFields.expiryDate = new Date(expiryDate);
        }

        // Ensure at least one field is being updated
        if (Object.keys(updateFields).length === 0) {
            return res.status(400).json({ message: "No fields to update" });
        }

        
        const result = await Medicine.updateOne({ _id: id }, { $set: updateFields });

        if (result.matchedCount === 0) {
            return res.status(404).json({ message: "Medicine not found" });
        }

        res.json({ message: 'Medicine updated successfully', result });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

