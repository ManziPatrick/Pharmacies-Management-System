const mongoose = require('mongoose');
const { Schema } = mongoose;

const subscriptionSchema = new Schema({
    pharmacistId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Reference to the User model (pharmacist)
        required: true
    },
    endpoint: {
        type: String,
        required: true
    },
    keys: {
        auth: {
            type: String,
            required: true
        },
        p256dh: {
            type: String,
            required: true
        }
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});


module.exports = mongoose.model('Subscription', subscriptionSchema);
