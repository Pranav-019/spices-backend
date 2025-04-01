const express = require("express");
const ProductOrder = require("../models/productOrderModel");
const Product = require("../models/productModel");
const User = require("../models/authModel");

const router = express.Router();

// Middleware to authenticate user
const authenticateUser = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "No token provided" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your_secret_key");
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

// Create an order
router.post("/create", authenticateUser, async (req, res) => {
  const { productId, quantity } = req.body;

  try {
    // Find the product and user
    const product = await Product.findById(productId);
    const user = await User.findById(req.userId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Calculate the total price based on the quantity
    const totalPrice = product.price * quantity;

    // Create the order
    const newOrder = new ProductOrder({
      user: user._id,
      product: product._id,
      name: product.name,
      description: product.description,
      image: product.image,
      price: totalPrice
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

// Update order status
router.put("/:id/status", authenticateUser, async (req, res) => {
  const { orderStatus } = req.body;

  if (!['Order Placed', 'Processing', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'].includes(orderStatus)) {
    return res.status(400).json({ message: "Invalid order status" });
  }

  try {
    const updatedOrder = await ProductOrder.findByIdAndUpdate(
      req.params.id,
      { orderStatus },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found" });
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

// Get orders by user
router.get("/user", authenticateUser, async (req, res) => {
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

// Get all orders (admin)
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
