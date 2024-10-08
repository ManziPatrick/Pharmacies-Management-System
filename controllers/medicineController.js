const { default: mongoose } = require('mongoose');
const Medicine = require('../models/medicine');
const MedicineCategory = require('../models/medicineCategory');
const User = require('../models/user');
const { sendPushNotification } = require('../services/pushService');

const validateMedicineFields = (fields) => {
    const { name, price, quantity, expiryDate, category, description} = fields;
    if (!name || !price || !quantity || !expiryDate || !category || !description) {
        return 'Name, price, quantity, expiry date, category, and description are required.';
    }
    return null;
};

exports.createMedicine = async (req, res) => {
    const { name, description, price, quantity, expiryDate, category, stockThreshold,pharmacyId } = req.body;

    try {
        console.log('Incoming request:', req.body);
        console.log('Uploaded files:', req.files);

        const validationError = validateMedicineFields(req.body);
        if (validationError) {
            return res.status(400).json({ message: validationError });
        }

        const existingCategory = await MedicineCategory.findById(category);
        if (!existingCategory) {
            return res.status(400).json({ message: 'Invalid category' });
        }

        
        const imagePaths = req.files ? req.files.map(file => file.path) : [];

        const newMedicine = new Medicine({
            name: name.trim(),
            description,
            price,
            quantity,
            expiryDate,
            category,
            stockThreshold: stockThreshold || 10, 
            pharmacyId,
            images: imagePaths,
        });

        const savedMedicine = await newMedicine.save();
        res.status(201).json(savedMedicine);
    } catch (error) {
        console.error('Error creating medicine:', error);
        res.status(500).json({ message: 'Server error while creating medicine.' });
    }
};



exports.updateMedicine = async (req, res) => {
    const { name, quantity, price, expiryDate, category } = req.body;
    const { id } = req.params; 

    try {
        const medicine = await Medicine.findById(id);
        if (!medicine) {
            return res.status(404).json({ message: 'Medicine not found.' });
        }

        if (name) medicine.name = name;
        if (quantity !== undefined) medicine.quantity = quantity;
        if (price !== undefined) medicine.price = price;
        if (expiryDate) medicine.expiryDate = expiryDate;
        if (category) {
            const categoryExists = await MedicineCategory.findById(category);
            if (!categoryExists) {
                return res.status(400).json({ message: 'Invalid category ID.' });
            }
            medicine.category = category;
        }

        const updatedMedicine = await medicine.save();

        const isStockLow = updatedMedicine.quantity < updatedMedicine.stockThreshold;
        const currentDate = new Date();
        const expiryThreshold = new Date();
        expiryThreshold.setDate(currentDate.getDate() + 30);
        const isExpiryNear = new Date(updatedMedicine.expiryDate) < expiryThreshold;

        if (isStockLow || isExpiryNear) {
            const pharmacists = await User.find({ role: 'pharmacist' });

            let notifications = [];

            if (isStockLow) {
                notifications.push({
                    title: 'Stock Alert',
                    message: `${updatedMedicine.name} is running low on stock at your pharmacy.`,
                });
            }

            if (isExpiryNear) {
                notifications.push({
                    title: 'Expiry Alert',
                    message: `${updatedMedicine.name} is expiring soon at your pharmacy.`,
                });
            }

            pharmacists.forEach(pharmacist => {
                const subscription = pharmacist.notificationSubscription;
                if (subscription && subscription.endpoint) { 
                    notifications.forEach(notificationData => {
                        sendPushNotification(subscription, notificationData);
                    });
                }
            });
        }

        res.status(200).json(updatedMedicine);
    } catch (error) {
        console.error('Error updating medicine:', error);
        res.status(400).json({ message: error.message });
    }
};


exports.getMedicines = async (req, res) => {
    try {
        const medicines = await Medicine.find({ pharmacyId: req.user._id }).populate('category', 'name description');
        res.status(200).json(medicines);
    } catch (error) {
        console.error('Error fetching medicines:', error);
        res.status(400).json({ message: error.message });
    }
};


exports.deleteMedicine = async (req, res) => {
    const { id } = req.params;  

    try {
        await Medicine.findByIdAndDelete(id);
        res.status(204).json({ message: 'Medicine deleted successfully' });
    } catch (error) {
        console.error('Error deleting medicine:', error);
        res.status(400).json({ message: error.message });
    }
};


exports.searchMedicines = async (req, res) => {
    const { searchTerm, category, expiryDate } = req.query;

    try {
        const query = {};

        if (searchTerm) {
            query.name = { $regex: searchTerm, $options: 'i' };
        }

        if (category) {
            query.category = category;
        }

        if (expiryDate) {
            const expiry = new Date(expiryDate);
            if (!isNaN(expiry.getTime())) {
                query.expiryDate = { $gte: expiry };
            } else {
                return res.status(400).json({ message: 'Invalid expiry date format' });
            }
        }

        const medicines = await Medicine.find(query).populate('category', 'name description').populate('pharmacyId', 'pharmacyName location');
        res.status(200).json(medicines);
    } catch (error) {
        console.error('Error searching medicines:', error);
        res.status(500).json({ message: error.message });
    }
};
exports.getAllMedicines = async (req, res) => {
    try {
        const { searchTerm, category, latitude, longitude } = req.query;

        const userLat = parseFloat(latitude) || 0;
        const userLon = parseFloat(longitude) || 0;

        let query = {};
        if (searchTerm) {
            query.name = { $regex: searchTerm, $options: 'i' };
        }

        if (category) {
            query.category = category;
        }

        const medicines = await Medicine.aggregate([
            { $match: query },
            {
                $lookup: {
                    from: "users",
                    localField: "pharmacyId",
                    foreignField: "_id",
                    as: "pharmacy"
                }
            },
            { $unwind: "$pharmacy" },
            {
                $lookup: {
                    from: "medicinecategories",
                    localField: "category",
                    foreignField: "_id",
                    as: "category"
                }
            },
            { $unwind: "$category" },
            {
                $addFields: {
                    distance: {
                        $multiply: [
                            {
                                $sqrt: {
                                    $add: [
                                        { $pow: [{ $subtract: ["$pharmacy.longitude", userLon] }, 2] },
                                        { $pow: [{ $subtract: ["$pharmacy.latitude", userLat] }, 2] }
                                    ]
                                }
                            },
                            111319.9
                        ]
                    }
                }
            },
            { $sort: { distance: 1 } },
            {
                $project: {
                    _id: 1,
                    name: 1,
                    quantity: 1,
                    price: 1,
                    expiryDate: 1,
                    distance: 1,
                    images: 1, 
                    category: {
                        _id: 1,
                        name: 1,
                        description: 1
                    },
                    "pharmacy.pharmacyName": 1,
                    "pharmacy.location": 1
                }
            }
        ]);

        res.status(200).json(medicines);
    } catch (error) {
        console.error('Error fetching all medicines:', error);
        res.status(500).json({ message: error.message });
    }
};



exports.getMedicinesByCategories = async (req, res) => {
    try {
        
        const medicinesByCategory = await MedicineCategory.aggregate([
            {
                $lookup: {
                    from: 'medicines', 
                    let: { categoryId: '$_id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ['$category', '$$categoryId'] },
                                        { $eq: ['$pharmacyId', req.user._id] } 
                                    ]
                                }
                            }
                        },
                        {
                            $project: {
                                _id: 1,
                                name: 1,
                                quantity: 1,
                                price: 1,
                                expiryDate: 1,
                                stockThreshold: 1
                            }
                        }
                    ],
                    as: 'medicines'
                }
            },
            {
                $project: {
                    _id: 1,
                    name: 1,
                    description: 1,
                    medicines: 1
                }
            }
        ]);

        res.status(200).json(medicinesByCategory);
    } catch (error) {
        console.error('Error fetching medicines by categories:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
exports.getMedicinesByCategoryId = async (req, res) => {
    const { categoryId } = req.params; 

    
    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
        return res.status(400).json({ message: 'Invalid category ID format.' });
    }

    try {
        
        const category = await MedicineCategory.findById(categoryId);
        if (!category) {
            return res.status(404).json({ message: 'Medicine category not found.' });
        }

        const medicines = await Medicine.find({ category: categoryId })
            .populate('category', 'name description')
            .populate('pharmacyId', 'pharmacyName location');
        res.status(200).json({
            category: {
                _id: category._id,
                name: category.name,
                description: category.description,
            },
            medicines
        });
    } catch (error) {
        console.error('Error fetching medicines by category ID:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

exports.getMedicineById = async (req, res) => {
    const { id } = req.params;  

   
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid medicine ID format.' });
    }

    try {
      
        const medicine = await Medicine.findById(id)
            .populate('category', 'name description') 
            .populate('pharmacyId', 'pharmacyName location'); 

        if (!medicine) {
            return res.status(404).json({ message: 'Medicine not found.' });
        }

        res.status(200).json(medicine);
    } catch (error) {
        console.error('Error fetching medicine by ID:', error);
    
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

exports.getAllMedicinesByPharmacyId = async (req, res) => {
    const { pharmacyId } = req.params; 

    if (!mongoose.Types.ObjectId.isValid(pharmacyId)) {
        return res.status(400).json({ message: 'Invalid pharmacy ID format.' });
    }

    try {
        const medicines = await Medicine.find({ pharmacyId }) 
            .populate('category', 'name description')
            .populate('pharmacyId', 'pharmacyName location'); 

        if (!medicines || medicines.length === 0) {
            return res.status(404).json({ message: 'No medicines found for this pharmacy.' });
        }

        res.status(200).json(medicines);
    } catch (error) {
        console.error('Error fetching medicines by pharmacy ID:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

