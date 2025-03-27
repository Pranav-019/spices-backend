const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  image: {
    type: String, // Store Cloudinary URL as a string
    required: true,
  },
}, { timestamps: true }); // Adds createdAt and updatedAt timestamps

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
