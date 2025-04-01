const mongoose = require("mongoose");

// Define the ProductOrder schema
const productOrderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  orderStatus: {
    type: String,
    enum: ['Order Placed', 'Processing', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'],
    default: 'Order Placed'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Create the ProductOrder model
const ProductOrder = mongoose.model("ProductOrder", productOrderSchema);

module.exports = ProductOrder;
