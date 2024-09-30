// seeders/seeder.js

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const connectDB = require('../config/db');
const MedicineCategory = require('../models/medicineCategory');
const Medicine = require('../models/medicine');
const User = require('../models/user');

dotenv.config();

// Sample Categories
const categories = [
    { name: 'Pain Reliever', description: 'Medicines used to reduce pain.' },
    { name: 'Antibiotics', description: 'Medicines that fight bacterial infections.' },
    { name: 'Antidepressants', description: 'Medicines used to treat depression.' },
    { name: 'Vitamins', description: 'Supplemental nutrients to support health.' },
    { name: 'Antihistamines', description: 'Medicines that reduce allergic reactions.' },
    { name: 'Antacids', description: 'Medicines that neutralize stomach acid.' },
    { name: 'Cough Suppressants', description: 'Medicines that reduce coughing.' },
    { name: 'Antifungals', description: 'Medicines used to treat fungal infections.' },
    { name: 'Steroids', description: 'Medicines that reduce inflammation.' },
    { name: 'Diuretics', description: 'Medicines that promote urine production.' },
];

// Sample Users (Pharmacies) in Rwanda
const users = [
    {
        pharmacyName: 'Pharma Plus Kigali',
        location: 'Kigali Central',
        phoneNumber: '0780000001',
        ownerName: 'Jean Kagame',
        licenseNumber: 'PHARMALICENSE001',
        email: 'jean.kagame@pharmaplus.rw',
        password: 'password123',
        role: 'pharmacist',
        latitude: -1.9500, // Approximate latitude for Kigali, Rwanda
        longitude: 30.0589, // Approximate longitude for Kigali, Rwanda
    },
    {
        pharmacyName: 'HealthFirst Butare',
        location: 'Butare Market',
        phoneNumber: '0780000002',
        ownerName: 'Alice Ndayizeye',
        licenseNumber: 'PHARMALICENSE002',
        email: 'alice.ndayizeye@healthfirst.rw',
        password: 'password123',
        role: 'pharmacist',
        latitude: -2.5167, // Approximate latitude for Butare, Rwanda
        longitude: 29.6833, // Approximate longitude for Butare, Rwanda
    },
    {
        pharmacyName: 'Medicare Ruhengeri',
        location: 'Ruhengeri Plaza',
        phoneNumber: '0780000003',
        ownerName: 'Pierre Uwimana',
        licenseNumber: 'PHARMALICENSE003',
        email: 'pierre.uwimana@medicare.rw',
        password: 'password123',
        role: 'pharmacist',
        latitude: -1.4992, // Approximate latitude for Ruhengeri, Rwanda
        longitude: 29.6375, // Approximate longitude for Ruhengeri, Rwanda
    },
    {
        pharmacyName: 'PharmaCare Gisenyi',
        location: 'Gisenyi Riverside',
        phoneNumber: '0780000004',
        ownerName: 'Marie Mukamana',
        licenseNumber: 'PHARMALICENSE004',
        email: 'marie.mukamana@pharmacare.rw',
        password: 'password123',
        role: 'pharmacist',
        latitude: -1.6877, // Approximate latitude for Gisenyi, Rwanda
        longitude: 29.9300, // Approximate longitude for Gisenyi, Rwanda
    },
    {
        pharmacyName: 'HealthPlus Nyagatare',
        location: 'Nyagatare Industrial Zone',
        phoneNumber: '0780000005',
        ownerName: 'David Habimana',
        licenseNumber: 'PHARMALICENSE005',
        email: 'david.habimana@healthplus.rw',
        password: 'password123',
        role: 'pharmacist',
        latitude: -1.5208, // Approximate latitude for Nyagatare, Rwanda
        longitude: 30.1700, // Approximate longitude for Nyagatare, Rwanda
    },
    // Additional users can be added here
];

// Sample Medicines
const medicines = [
    {
        name: 'Aspirin',
        categoryName: 'Pain Reliever',
        quantity: 100,
        price: 5.99,
        expiryDate: new Date('2025-12-31'),
        stockThreshold: 20,
    },
    {
        name: 'Amoxicillin',
        categoryName: 'Antibiotics',
        quantity: 50,
        price: 12.99,
        expiryDate: new Date('2024-06-30'),
        stockThreshold: 10,
    },
    {
        name: 'Sertraline',
        categoryName: 'Antidepressants',
        quantity: 75,
        price: 15.49,
        expiryDate: new Date('2025-01-15'),
        stockThreshold: 15,
    },
    {
        name: 'Vitamin C',
        categoryName: 'Vitamins',
        quantity: 200,
        price: 8.99,
        expiryDate: new Date('2026-03-20'),
        stockThreshold: 30,
    },
    {
        name: 'Loratadine',
        categoryName: 'Antihistamines',
        quantity: 120,
        price: 9.99,
        expiryDate: new Date('2025-08-10'),
        stockThreshold: 25,
    },
    {
        name: 'Omeprazole',
        categoryName: 'Antacids',
        quantity: 90,
        price: 7.99,
        expiryDate: new Date('2025-11-05'),
        stockThreshold: 20,
    },
    {
        name: 'Dextromethorphan',
        categoryName: 'Cough Suppressants',
        quantity: 60,
        price: 6.49,
        expiryDate: new Date('2024-09-25'),
        stockThreshold: 12,
    },
    {
        name: 'Clotrimazole',
        categoryName: 'Antifungals',
        quantity: 80,
        price: 10.99,
        expiryDate: new Date('2025-04-18'),
        stockThreshold: 18,
    },
    {
        name: 'Prednisone',
        categoryName: 'Steroids',
        quantity: 40,
        price: 20.00,
        expiryDate: new Date('2024-12-12'),
        stockThreshold: 8,
    },
    {
        name: 'Furosemide',
        categoryName: 'Diuretics',
        quantity: 70,
        price: 14.75,
        expiryDate: new Date('2025-07-07'),
        stockThreshold: 14,
    },
    // Additional medicines can be added here
];

// Admin User Details
const adminUser = {
    pharmacyName: 'Admin Pharmacy Kigali',
    location: 'Kigali Central',
    phoneNumber: '0780000010',
    ownerName: 'Emmanuel Nshimiyimana',
    licenseNumber: 'PHARMALICENSEADMIN',
    email: 'admin@pharmacy.rw',
    password: 'adminpassword',
    role: 'admin',
    latitude: -1.9500, // Kigali's approximate latitude
    longitude: 30.0589, // Kigali's approximate longitude
};

const seedData = async () => {
    try {
        await connectDB();

        // Delete existing data (optional)
        await MedicineCategory.deleteMany();
        await Medicine.deleteMany();
        await User.deleteMany();
        console.log('Existing data cleared.');

        // Insert Categories
        const createdCategories = await MedicineCategory.insertMany(categories);
        console.log(`${createdCategories.length} categories created.`);

        // Create Users (Pharmacies)
        const createdUsers = [];
        for (const userData of users) {
            // Hash the password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(userData.password, salt);

            const user = await User.create({
                pharmacyName: userData.pharmacyName,
                location: userData.location,
                phoneNumber: userData.phoneNumber,
                ownerName: userData.ownerName,
                licenseNumber: userData.licenseNumber,
                email: userData.email,
                password: hashedPassword,
                role: userData.role,
                latitude: userData.latitude,
                longitude: userData.longitude,
            });
            createdUsers.push(user);
            console.log(`User created: ${user.email}`);
        }

        // Create Admin User
        const adminSalt = await bcrypt.genSalt(10);
        const adminHashedPassword = await bcrypt.hash(adminUser.password, adminSalt);

        const admin = await User.create({
            pharmacyName: adminUser.pharmacyName,
            location: adminUser.location,
            phoneNumber: adminUser.phoneNumber,
            ownerName: adminUser.ownerName,
            licenseNumber: adminUser.licenseNumber,
            email: adminUser.email,
            password: adminHashedPassword,
            role: adminUser.role,
            latitude: adminUser.latitude,
            longitude: adminUser.longitude,
        });
        console.log(`Admin user created: ${admin.email}`);

        // Create a map for category name to ObjectId
        const categoryMap = {};
        createdCategories.forEach(category => {
            categoryMap[category.name] = category._id;
        });

        // Create Medicines and assign to random users
        const createdMedicines = [];
        for (const med of medicines) {
            // Randomly assign a pharmacy
            const randomUser = createdUsers[Math.floor(Math.random() * createdUsers.length)];
            const medicine = await Medicine.create({
                name: med.name,
                category: categoryMap[med.categoryName],
                quantity: med.quantity,
                price: med.price,
                expiryDate: med.expiryDate,
                stockThreshold: med.stockThreshold,
                pharmacyId: randomUser._id,
            });
            createdMedicines.push(medicine);
            console.log(`Medicine created: ${medicine.name} for pharmacy ${randomUser.pharmacyName}`);
        }

        // Create Admin User's Medicines (optional)
        // You can create additional medicines for the admin pharmacy if needed

        console.log('Seeding completed successfully.');
        process.exit();
    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
};

seedData();
