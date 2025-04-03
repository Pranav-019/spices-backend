const jwt = require("jsonwebtoken");
const User = require("../models/authModel");
const SECRET_KEY = process.env.JWT_SECRET || "your_secret_key";

// Regular user authentication
const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    
    if (!token) {
        return res.status(401).json({ message: "No token provided" });
    }

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        req.userId = decoded.userId;
        next();
    } catch (error) {
        console.error("Token verification error:", error);
        return res.status(401).json({ message: "Invalid token" });
    }
};

// Admin verification middleware with logging
const verifyAdmin = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ message: "No token provided" });
        }

        const decoded = jwt.verify(token, SECRET_KEY);
        const user = await User.findById(decoded.userId);
        
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (!user.isAdmin) {
            console.warn(`Unauthorized admin access attempt by ${user.email}`);
            return res.status(403).json({ message: "Admin access required" });
        }

        // Add user info to request
        req.userId = decoded.userId;
        req.isAdmin = true;
        req.userEmail = user.email;

        // Log successful admin access
        console.log(`Admin access granted to ${user.email} at ${new Date().toISOString()}`);
        
        next();
    } catch (error) {
        console.error("Admin verification error:", error);
        return res.status(401).json({ 
            message: "Authentication failed",
            error: error.message 
        });
    }
};

module.exports = { 
    verifyToken,  // For regular user routes
    verifyAdmin   // For admin-only routes
};