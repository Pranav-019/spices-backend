const express = require("express");
const router = express.Router();
const Order = require("../models/orderModel");

// Create a new order
router.post("/create", async (req, res) => {
    try {
        const newOrder = new Order(req.body);
        await newOrder.save();
        res.status(201).json({ message: "Order created successfully", order: newOrder });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all orders
router.get("/", async (req, res) => {
    try {
        const orders = await Order.find();
        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get a specific order by ID
router.get("/:id", async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: "Order not found" });
        res.json(order);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update order status
router.put("/:id/status", async (req, res) => {
    try {
        const { orderStatus } = req.body;
        const order = await Order.findByIdAndUpdate(req.params.id, { orderStatus }, { new: true });
        if (!order) return res.status(404).json({ message: "Order not found" });
        res.json({ message: "Order status updated", order });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete an order
router.delete("/:id", async (req, res) => {
    try {
        const order = await Order.findByIdAndDelete(req.params.id);
        if (!order) return res.status(404).json({ message: "Order not found" });
        res.json({ message: "Order deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
