const express = require("express");
const router = express.Router();
const Order = require("../models/orderModel");
const { verifyToken } = require("../middleware/authMiddleware");

// Create a new order (protected route)
router.post("/create", verifyToken, async (req, res) => {
    try {
        const newOrder = new Order({
            ...req.body,
            user: req.userId // Add the user ID from the verified token
        });
        await newOrder.save();
        res.status(201).json({ message: "Order created successfully", order: newOrder });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all orders for the logged-in user (protected route)
router.get("/", verifyToken, async (req, res) => {
    try {
        const orders = await Order.find({ user: req.userId });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get a specific order by ID (protected to owner only)
router.get("/:id", verifyToken, async (req, res) => {
    try {
        const order = await Order.findOne({ 
            _id: req.params.id,
            user: req.userId 
        });
        
        if (!order) return res.status(404).json({ 
            message: "Order not found or not authorized" 
        });
        
        res.json(order);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update order status (protected to owner only)
router.put("/:id/status", verifyToken, async (req, res) => {
    try {
        const { orderStatus } = req.body;
        const order = await Order.findOneAndUpdate(
            { 
                _id: req.params.id,
                user: req.userId 
            },
            { orderStatus },
            { new: true }
        );
        
        if (!order) return res.status(404).json({ 
            message: "Order not found or not authorized" 
        });
        
        res.json({ message: "Order status updated", order });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete an order (protected to owner only)
router.delete("/:id", verifyToken, async (req, res) => {
    try {
        const order = await Order.findOneAndDelete({
            _id: req.params.id,
            user: req.userId
        });
        
        if (!order) return res.status(404).json({ 
            message: "Order not found or not authorized" 
        });
        
        res.json({ message: "Order deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;