require("dotenv").config(); // Load environment variables

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

// Import Routes
const productRoutes = require("./routes/productRoute");
const razorpayRoutes = require("./routes/razorpayRoute");
const authRoutes = require("./routes/authRoutes");
const orderRoutes = require("./routes/orderRoutes");
const productOrderModel = require("./routes/ProductOrderRoute");


const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

// Middleware
app.use(cors());
app.use(express.json());

// Logging Middleware (for debugging)
app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.url}`);
  next();
});

// MongoDB Connection
mongoose
  .connect(MONGODB_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// API Routes
app.use("/api/products", productRoutes);
app.use("/api", razorpayRoutes);
app.use("/api/auth", authRoutes);  // FIXED: Now under /api/auth
app.use("/api/orders", orderRoutes);
app.use("/api/productorder", productOrderModel)
// Root Route (for testing)
app.get("/", (req, res) => {
  res.send("Server is running...");
});

// Start the Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
