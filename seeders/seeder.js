const mongoose = require('mongoose');
const User = require('../models/user'); // Adjust the path according to your project structure
const Medicine = require('../models/medicine'); // Adjust the path according to your project structure
const Category = require('../models/medicineCategory'); // Adjust the path according to your project structure

async function seedDatabase() {
    try {
        await mongoose.connect('mongodb://localhost:27017/pharmacy', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        // Clear existing data
        await User.deleteMany({});
        await Medicine.deleteMany({});
        await Category.deleteMany({});

        // Seed Categories
        const categories = await Category.insertMany([
            { name: 'Pain Relief' },
            { name: 'Antibiotics' },
            { name: 'Vitamins' },
            { name: 'Cough & Cold' },
            { name: 'Digestive Health' },
            { name: 'Cardiovascular' },
            { name: 'Allergy' },
            { name: 'Diabetes' },
            { name: 'Skin Care' },
            { name: 'Respiratory' },
        ]);

        // Seed Medicines with multiple images and detailed information
        const medicines = await Medicine.insertMany([
            {
                name: 'Paracetamol',
                category: categories[0]._id, // Pain Relief
                description: 'Paracetamol is used to treat mild to moderate pain and reduce fever. It is commonly used for headaches, muscle aches, arthritis, backaches, toothaches, colds, and fevers.',
                price: 2000,
                images: [
                    'https://example.com/images/paracetamol1.jpg',
                    'https://example.com/images/paracetamol2.jpg',
                    'https://example.com/images/paracetamol3.jpg',
                ],
            },
            {
                name: 'Amoxicillin',
                category: categories[1]._id, // Antibiotics
                description: 'Amoxicillin is an antibiotic used to treat a variety of bacterial infections, including pneumonia, bronchitis, and infections of the ear, nose, throat, skin, and urinary tract.',
                price: 3500,
                images: [
                    'https://example.com/images/amoxicillin1.jpg',
                    'https://example.com/images/amoxicillin2.jpg',
                    'https://example.com/images/amoxicillin3.jpg',
                ],
            },
            {
                name: 'Vitamin C',
                category: categories[2]._id, // Vitamins
                description: 'Vitamin C is an essential nutrient that supports the immune system, promotes collagen production, and acts as an antioxidant.',
                price: 1500,
                images: [
                    'https://example.com/images/vitamin-c1.jpg',
                    'https://example.com/images/vitamin-c2.jpg',
                    'https://example.com/images/vitamin-c3.jpg',
                ],
            },
            {
                name: 'Cough Syrup',
                category: categories[3]._id, // Cough & Cold
                description: 'Cough syrup relieves cough and soothes throat irritation, providing relief from dry and productive coughs.',
                price: 2500,
                images: [
                    'https://example.com/images/cough-syrup1.jpg',
                    'https://example.com/images/cough-syrup2.jpg',
                    'https://example.com/images/cough-syrup3.jpg',
                ],
            },
            {
                name: 'Loperamide',
                category: categories[4]._id, // Digestive Health
                description: 'Loperamide is used to treat diarrhea by slowing down the movement in the gut, which decreases the number of bowel movements.',
                price: 2000,
                images: [
                    'https://example.com/images/loperamide1.jpg',
                    'https://example.com/images/loperamide2.jpg',
                    'https://example.com/images/loperamide3.jpg',
                ],
            },
            {
                name: 'Amlodipine',
                category: categories[5]._id, // Cardiovascular
                description: 'Amlodipine is used to treat high blood pressure and angina (chest pain) by relaxing blood vessels to improve blood flow.',
                price: 4000,
                images: [
                    'https://example.com/images/amlodipine1.jpg',
                    'https://example.com/images/amlodipine2.jpg',
                    'https://example.com/images/amlodipine3.jpg',
                ],
            },
            {
                name: 'Cetirizine',
                category: categories[6]._id, // Allergy
                description: 'Cetirizine is an antihistamine that relieves allergy symptoms such as runny nose, sneezing, and itchy eyes.',
                price: 1800,
                images: [
                    'https://example.com/images/cetirizine1.jpg',
                    'https://example.com/images/cetirizine2.jpg',
                    'https://example.com/images/cetirizine3.jpg',
                ],
            },
            {
                name: 'Metformin',
                category: categories[7]._id, // Diabetes
                description: 'Metformin is used to improve blood sugar control in adults with type 2 diabetes. It helps the body respond better to insulin.',
                price: 3000,
                images: [
                    'https://example.com/images/metformin1.jpg',
                    'https://example.com/images/metformin2.jpg',
                    'https://example.com/images/metformin3.jpg',
                ],
            },
            {
                name: 'Hydrocortisone Cream',
                category: categories[8]._id, // Skin Care
                description: 'Hydrocortisone cream is used to relieve inflammation and itching caused by various skin conditions.',
                price: 2500,
                images: [
                    'https://example.com/images/hydrocortisone1.jpg',
                    'https://example.com/images/hydrocortisone2.jpg',
                    'https://example.com/images/hydrocortisone3.jpg',
                ],
            },
            {
                name: 'Salbutamol Inhaler',
                category: categories[9]._id, // Respiratory
                description: 'Salbutamol is a bronchodilator that relaxes the muscles in the airways and increases air flow to the lungs, used for asthma and COPD.',
                price: 3500,
                images: [
                    'https://example.com/images/salbutamol1.jpg',
                    'https://example.com/images/salbutamol2.jpg',
                    'https://example.com/images/salbutamol3.jpg',
                ],
            },
            {
                name: 'Ibuprofen',
                category: categories[0]._id, // Pain Relief
                description: 'Ibuprofen is a nonsteroidal anti-inflammatory drug (NSAID) that reduces fever, pain, and inflammation.',
                price: 2000,
                images: [
                    'https://example.com/images/ibuprofen1.jpg',
                    'https://example.com/images/ibuprofen2.jpg',
                    'https://example.com/images/ibuprofen3.jpg',
                ],
            },
            {
                name: 'Ciprofloxacin',
                category: categories[1]._id, // Antibiotics
                description: 'Ciprofloxacin is an antibiotic that treats a variety of bacterial infections, including skin infections, respiratory infections, and urinary tract infections.',
                price: 4000,
                images: [
                    'https://example.com/images/ciprofloxacin1.jpg',
                    'https://example.com/images/ciprofloxacin2.jpg',
                    'https://example.com/images/ciprofloxacin3.jpg',
                ],
            },
            {
                name: 'Folic Acid',
                category: categories[2]._id, // Vitamins
                description: 'Folic acid is a B-vitamin that is important for cell division and the production of DNA and RNA, essential during pregnancy.',
                price: 1200,
                images: [
                    'https://example.com/images/folic-acid1.jpg',
                    'https://example.com/images/folic-acid2.jpg',
                    'https://example.com/images/folic-acid3.jpg',
                ],
            },
            {
                name: 'Guaifenesin',
                category: categories[3]._id, // Cough & Cold
                description: 'Guaifenesin is an expectorant that helps loosen congestion in the chest and throat, making it easier to cough out through the mouth.',
                price: 2300,
                images: [
                    'https://example.com/images/guaifenesin1.jpg',
                    'https://example.com/images/guaifenesin2.jpg',
                    'https://example.com/images/guaifenesin3.jpg',
                ],
            },
            {
                name: 'Omeprazole',
                category: categories[4]._id, // Digestive Health
                description: 'Omeprazole is used to treat certain stomach and esophagus problems (such as acid reflux, ulcers). It works by decreasing the amount of acid the stomach makes.',
                price: 2900,
                images: [
                    'https://example.com/images/omeprazole1.jpg',
                    'https://example.com/images/omeprazole2.jpg',
                    'https://example.com/images/omeprazole3.jpg',
                ],
            },
            {
                name: 'Atorvastatin',
                category: categories[5]._id, // Cardiovascular
                description: 'Atorvastatin is used to lower cholesterol and triglycerides in the blood, helping to reduce the risk of heart disease.',
                price: 3700,
                images: [
                    'https://example.com/images/atorvastatin1.jpg',
                    'https://example.com/images/atorvastatin2.jpg',
                    'https://example.com/images/atorvastatin3.jpg',
                ],
            },
            {
                name: 'Loratadine',
                category: categories[6]._id, // Allergy
                description: 'Loratadine is an antihistamine that reduces allergy symptoms such as runny nose, sneezing, and itchy/watery eyes.',
                price: 1600,
                images: [
                    'https://example.com/images/loratadine1.jpg',
                    'https://example.com/images/loratadine2.jpg',
                    'https://example.com/images/loratadine3.jpg',
                ],
            },
            {
                name: 'Insulin',
                category: categories[7]._id, // Diabetes
                description: 'Insulin is a hormone that lowers blood sugar levels. It is used to treat type 1 and type 2 diabetes.',
                price: 6000,
                images: [
                    'https://example.com/images/insulin1.jpg',
                    'https://example.com/images/insulin2.jpg',
                    'https://example.com/images/insulin3.jpg',
                ],
            },
            {
                name: 'Benzoyl Peroxide',
                category: categories[8]._id, // Skin Care
                description: 'Benzoyl peroxide is used to treat acne by killing bacteria and drying excess oil and skin cells.',
                price: 2400,
                images: [
                    'https://example.com/images/benzoyl-peroxide1.jpg',
                    'https://example.com/images/benzoyl-peroxide2.jpg',
                    'https://example.com/images/benzoyl-peroxide3.jpg',
                ],
            },
            {
                name: 'Fluticasone Nasal Spray',
                category: categories[9]._id, // Respiratory
                description: 'Fluticasone nasal spray is used to treat seasonal and year-round allergic rhinitis. It works by reducing inflammation in the nasal passages.',
                price: 3500,
                images: [
                    'https://example.com/images/fluticasone1.jpg',
                    'https://example.com/images/fluticasone2.jpg',
                    'https://example.com/images/fluticasone3.jpg',
                ],
            },
        ]);

        console.log('Database seeded successfully!');
        mongoose.connection.close();
    } catch (error) {
        console.error('Error seeding database:', error);
    }
}

seedDatabase();
