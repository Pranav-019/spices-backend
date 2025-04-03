const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/authModel");
const Order = require("../models/orderModel");
const ProductOrder = require("../models/productOrderModel");

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
  const { name, email, password, contactNo, addresses } = req.body;
  
  if (!name || !email || !password) {
    return res.status(400).json({ message: "Name, email, and password are required" });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    const user = new User({ 
      name, 
      email, 
      password, 
      contactNo, 
      addresses: addresses || [] 
    });
    await user.save();

    const token = jwt.sign({ userId: user._id }, SECRET_KEY, { expiresIn: "1h" });

    res.status(201).json({ 
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        contactNo: user.contactNo || null,
        addresses: user.addresses
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
        addresses: user.addresses
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get User Data with Orders and ProductOrders
router.get("/user", authenticateUser, async (req, res) => {
  try {
    const user = await User.findById(req.userId)
      .select("-password")
      .populate({
        path: 'orders',
        model: 'Order'
      })
      .populate({
        path: 'productOrders',
        model: 'ProductOrder'
      });

    if (!user) return res.status(404).json({ message: "User not found" });

    // Also fetch product orders separately since they might not be referenced in User model
    const productOrders = await ProductOrder.find({ user: req.userId });

    res.status(200).json({
      ...user.toObject(),
      productOrders
    });
  } catch (error) {
    console.error("User data error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Update User Information
router.put("/update", authenticateUser, async (req, res) => {
  try {
    const { name, contactNo, addresses } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (contactNo) updateData.contactNo = contactNo;
    if (addresses) updateData.addresses = addresses;

    const updatedUser = await User.findByIdAndUpdate(
      req.userId,
      updateData,
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

// Address Management Endpoints
router.post("/addresses", authenticateUser, async (req, res) => {
  try {
    const newAddress = req.body;
    
    // Validate required fields
    if (!newAddress.houseFlatNo || !newAddress.landmark || !newAddress.street || 
        !newAddress.area || !newAddress.city || !newAddress.state || !newAddress.pincode) {
      return res.status(400).json({ message: "All address fields are required" });
    }

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // If this is the first address, set as default
    if (user.addresses.length === 0) {
      newAddress.isDefault = true;
    }

    user.addresses.push(newAddress);
    await user.save();

    res.status(201).json({
      message: "Address added successfully",
      addresses: user.addresses
    });
  } catch (error) {
    console.error("Add address error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/addresses/:addressId", authenticateUser, async (req, res) => {
  try {
    const { addressId } = req.params;
    const updatedAddress = req.body;

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const addressIndex = user.addresses.findIndex(addr => addr._id.toString() === addressId);
    if (addressIndex === -1) {
      return res.status(404).json({ message: "Address not found" });
    }

    user.addresses[addressIndex] = {
      ...user.addresses[addressIndex].toObject(),
      ...updatedAddress
    };

    await user.save();

    res.status(200).json({
      message: "Address updated successfully",
      addresses: user.addresses
    });
  } catch (error) {
    console.error("Update address error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.delete("/addresses/:addressId", authenticateUser, async (req, res) => {
  try {
    const { addressId } = req.params;

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const addressIndex = user.addresses.findIndex(addr => addr._id.toString() === addressId);
    if (addressIndex === -1) {
      return res.status(404).json({ message: "Address not found" });
    }

    // If deleting default address, set another address as default if available
    if (user.addresses[addressIndex].isDefault && user.addresses.length > 1) {
      const newDefaultIndex = addressIndex === 0 ? 1 : 0;
      user.addresses[newDefaultIndex].isDefault = true;
    }

    user.addresses.splice(addressIndex, 1);
    await user.save();

    res.status(200).json({
      message: "Address deleted successfully",
      addresses: user.addresses
    });
  } catch (error) {
    console.error("Delete address error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/addresses/:addressId/set-default", authenticateUser, async (req, res) => {
  try {
    const { addressId } = req.params;

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Reset all addresses to non-default
    user.addresses.forEach(addr => {
      addr.isDefault = false;
    });

    // Set the specified address as default
    const address = user.addresses.find(addr => addr._id.toString() === addressId);
    if (!address) {
      return res.status(404).json({ message: "Address not found" });
    }

    address.isDefault = true;
    await user.save();

    res.status(200).json({
      message: "Default address updated successfully",
      addresses: user.addresses
    });
  } catch (error) {
    console.error("Set default address error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get('/admin/check', authenticateUser, async (req, res) => {
  const user = await User.findById(req.userId);
  res.json({ isAdmin: user.isAdmin });
});

router.get("/all", async (req, res) => {
  try {
    // Check if the requesting user is an admin
    const requestingUser = await User.findById(req.userId);
    if (!requestingUser || !requestingUser.isAdmin) {
      return res.status(403).json({ message: "Unauthorized: Admin access required" });
    }

    // Get all users excluding their passwords
    const users = await User.find({}).select("-password");
    
    res.status(200).json(users);
  } catch (error) {
    console.error("Get all users error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router; 