const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    payer_id: {
        type: String,
        required: true
    },
    user_id: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    status: {
        type: String,
        default: 'pending'
    },
    amount: Number,
    mpesa_receipt: String,
    mpesa_date: String,
    phone_number: Number
}, {
    timestamps: true
});

module.exports = mongoose.model('Payment', paymentSchema);