const jwt = require("jsonwebtoken");
const User = require("../models/authModel"); // Make sure to import your User model
const SECRET_KEY = process.env.JWT_SECRET || "your_secret_key";

const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    
    if (!token) {
        return res.status(401).json({ message: "No token provided" });
    }

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        req.userId = decoded.userId; // Add userId to the request object
        next();
    } catch (error) {
        console.error("Token verification error:", error);
        return res.status(401).json({ message: "Invalid token" });
    }
};

// New admin verification middleware
const verifyAdmin = async (req, res, next) => {
    try {
        // First verify the token
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ message: "No token provided" });
        }

        const decoded = jwt.verify(token, SECRET_KEY);
        
        // Check if user exists and is admin
        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (!user.isAdmin) {
            return res.status(403).json({ message: "Admin access required" });
        }

        req.userId = decoded.userId;
        req.isAdmin = true; // Add admin flag to request
        next();
    } catch (error) {
        console.error("Admin verification error:", error);
        return res.status(401).json({ message: "Invalid token or admin privileges" });
    }
};

module.exports = { 
    verifyToken,  // For regular user routes
    verifyAdmin   // For admin-only routes
};