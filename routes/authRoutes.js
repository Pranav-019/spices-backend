const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/authModel");

const router = express.Router();
const SECRET_KEY = process.env.JWT_SECRET || "your_secret_key";

// Middleware to authenticate user
const authenticateUser = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "No token provided" });

    const decoded = jwt.verify(token, SECRET_KEY);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

// Sign Up
router.post("/signup", async (req, res) => {
  const { name, email, password, contactNo, address } = req.body;
  
  if (!name || !email || !password) {
    return res.status(400).json({ message: "Name, email, and password are required" });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    const user = new User({ name, email, password, contactNo, address });
    await user.save();

    const token = jwt.sign({ userId: user._id }, SECRET_KEY, { expiresIn: "1h" });

    res.status(201).json({ 
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        contactNo: user.contactNo || null,
        address: user.address || null
      }
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user || user.password !== password) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user._id }, SECRET_KEY, { expiresIn: "1h" });

    res.status(200).json({ 
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        contactNo: user.contactNo || null,
        address: user.address || null
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get User Data with Orders
router.get("/user", authenticateUser, async (req, res) => {
  try {
    const user = await User.findById(req.userId)
      .select("-password")
      .populate("orders");

    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json(user);
  } catch (error) {
    console.error("User data error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Update User Information (PUT route)
router.put("/update", authenticateUser, async (req, res) => {
  try {
    const { name, contactNo, address } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.userId,
      { name, contactNo, address },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ 
      message: "User updated successfully",
      user: updatedUser 
    });
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
