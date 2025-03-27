const mongoose = require('mongoose');

const RazorpaySchema = new mongoose.Schema({
    orderId: { type: String, required: true, unique: true },
    paymentId: { type: String },
    signature: { type: String },
    amount: { type: Number, required: true },
    status: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('RazorpayPayment', RazorpaySchema);
