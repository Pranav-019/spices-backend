const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/authModel");

const router = express.Router();
const SECRET_KEY = "your_secret_key"; // Change this in production

// Sign Up
router.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    const user = new User({ name, email, password });
    await user.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || user.password !== password) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user._id }, SECRET_KEY, { expiresIn: "1h" });
    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
