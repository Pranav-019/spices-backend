const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    category: { type: String, required: true },
    productName: { type: String, required: true },
    quantity: { type: Number, required: true },
    grindLevel: { type: String, required: false },
    specialInstructions: { type: String, required: false },
    tokenAmount: { type: Number, required: true },
    orderStatus: { 
        type: String, 
        required: true,
        enum: ['Order Placed', 'Processing', 'Confirmed' ,'Shipped', 'Delivered', 'Cancelled'],
        default: 'Order Placed'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Order = mongoose.model("Order", orderSchema);
module.exports = Order;