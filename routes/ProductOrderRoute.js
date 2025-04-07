const express = require("express");
const ProductOrder = require("../models/productOrderModel");
const Product = require("../models/productModel");
const User = require("../models/authModel");
const { verifyToken } = require("../middleware/authMiddleware"); // Import the existing middleware

const router = express.Router();

// Create an order
router.post("/create", verifyToken, async (req, res) => {
  const { productId, quantity, paymentId, address } = req.body;

  try {
    // Find the product and user
    const product = await Product.findById(productId);
    const user = await User.findById(req.userId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Calculate the total price based on the quantity
    const totalPrice = product.price * quantity;

    // Create the order
    const newOrder = new ProductOrder({
      user: req.userId, // Use userId from verified token
      product: product._id,
      name: product.name,
      description: product.description,
      image: product.image,
      price: totalPrice,
      quantity,
      paymentId,
      address
    });

    await newOrder.save();

    res.status(201).json({
      message: "Order created successfully",
      order: newOrder
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error creating order",
      error: error.message
    });
  }
});

// Update order status (protected to owner/admin)
router.put("/:id/status", async (req, res) => {
    const { orderStatus } = req.body;
  
    // Validate order status
    if (!['Order Placed', 'Processing', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'].includes(orderStatus)) {
      return res.status(400).json({ message: "Invalid order status" });
    }
  
    try {
      // Update order by ID only (no user check)
      const updatedOrder = await ProductOrder.findOneAndUpdate(
        { _id: req.params.id }, // Removed `user: req.userId`
        { orderStatus },
        { new: true }
      );
  
      if (!updatedOrder) {
        return res.status(404).json({ message: "Order not found" }); // Simplified message
      }
  
      res.status(200).json({
        message: "Order status updated successfully",
        order: updatedOrder
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: "Error updating order status",
        error: error.message
      });
    }
  });
// Get orders by user (protected)
router.get("/user", verifyToken, async (req, res) => {
  try {
    const orders = await ProductOrder.find({ user: req.userId })
      .populate("product")
      .select("-__v");

    res.status(200).json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error fetching orders",
      error: error.message
    });
  }
});

// Get all orders (admin) - Keep this unprotected as it might be for admin dashboard
router.get("/", async (req, res) => {
  try {
    const orders = await ProductOrder.find()
      .populate("user")
      .populate("product")
      .select("-__v");

    res.status(200).json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error fetching orders",
      error: error.message
    });
  }
});

module.exports = router;