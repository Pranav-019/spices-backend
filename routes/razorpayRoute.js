const express = require('express');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const RazorpayPayment = require('../models/razorpayModel'); // Importing model
require('dotenv').config();

const router = express.Router();

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ✅ **Create Order**
router.post('/create-order', async (req, res) => {
    try {
        const { amount } = req.body;
        const options = {
            amount: amount * 100, // Razorpay accepts amount in paise
            currency: 'INR',
            receipt: `order_${Date.now()}`,
        };

        const order = await razorpay.orders.create(options);

        // Save to database
        const newPayment = new RazorpayPayment({
            orderId: order.id,
            amount: amount,
            status: 'pending',
        });

        await newPayment.save();

        res.json(order);
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ error: 'Error creating order' });
    }
});

// ✅ **Verify Payment**
router.post('/verify-payment', async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest('hex');

        if (expectedSignature === razorpay_signature) {
            await RazorpayPayment.findOneAndUpdate(
                { orderId: razorpay_order_id },
                { paymentId: razorpay_payment_id, signature: razorpay_signature, status: 'paid' }
            );

            res.json({ success: true, message: 'Payment verified successfully' });
        } else {
            res.status(400).json({ error: 'Invalid signature' });
        }
    } catch (error) {
        console.error('Error verifying payment:', error);
        res.status(500).json({ error: 'Error verifying payment' });
    }
});

module.exports = router;
