const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    category: { type: String, required: true },
    productName: { type: String, required: true },
    quantity: { type: Number, required: true },
    grindLevel: { type: String, required: false },
    specialInstructions: { type: String, required: false },
    tokenAmount: { type: Number, required: true },
    orderStatus: { type: String, required: true } // Possible values: Pending, Processing, Completed, Canceled
});

const Order = mongoose.model("Order", orderSchema);
module.exports = Order;
