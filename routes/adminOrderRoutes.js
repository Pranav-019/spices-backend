const express = require("express");
const router = express.Router();
const Order = require("../models/orderModel");
const ProductOrder = require("../models/productOrderModel");
const { authenticateAdmin } = require("../middleware/authMiddleware");

// Get ALL orders (admin only)
router.get("/orders", authenticateAdmin, async (req, res) => {
  try {
    const orders = await Order.find().populate("user", "name email");
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get ALL product orders (admin only)
router.get("/product-orders", authenticateAdmin, async (req, res) => {
  try {
    const orders = await ProductOrder.find().populate("user", "name email");
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update any order status (admin only)
router.put("/orders/:id/status", authenticateAdmin, async (req, res) => {
  try {
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      { orderStatus: req.body.orderStatus },
      { new: true }
    );
    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update any product order status (admin only)
router.put("/product-orders/:id/status", authenticateAdmin, async (req, res) => {
  try {
    const updatedOrder = await ProductOrder.findByIdAndUpdate(
      req.params.id,
      { orderStatus: req.body.orderStatus },
      { new: true }
    );
    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;