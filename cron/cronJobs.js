const cron = require('node-cron');
const Medicine = require('../models/medicine');
const { notifyPharmacists } = require('../services/pushService');

// Check daily for medicines that are expiring or have low stock
cron.schedule('0 0 * * *', async () => {
    const expiryThreshold = new Date();
    expiryThreshold.setDate(expiryThreshold.getDate() + 30);  // Notify if expiring in 30 days

    try {
        // Find medicines that are near expiry or low on stock
        const expiringMedicines = await Medicine.find({
            expiryDate: { $lt: expiryThreshold },
        });

        const lowStockMedicines = await Medicine.find({
            quantity: { $lt: 5 },
        });

        // Notify for expiring medicines
        expiringMedicines.forEach((medicine) => {
            notifyPharmacists({
                title: 'Expiry Alert',
                message: `${medicine.name} is expiring soon at your pharmacy.`,
            });
        });

        // Notify for low stock medicines
        lowStockMedicines.forEach((medicine) => {
            notifyPharmacists({
                title: 'Stock Alert',
                message: `${medicine.name} is running low on stock at your pharmacy.`,
            });
        });

        console.log('Checked medicines for expiry and stock levels.');
    } catch (error) {
        console.error('Error in cron job:', error);
    }
});
