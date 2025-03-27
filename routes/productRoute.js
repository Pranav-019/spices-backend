const express = require("express");
const Product = require("../models/productModel");
const { upload, uploadToImageKit } = require("../upload"); // Import middleware for ImageKit upload

const router = express.Router();

// Add a new product
router.post("/add", upload.single("image"), uploadToImageKit, async (req, res) => {
  try {
    const { category, name, price, description } = req.body;

    // The ImageKit URL is stored in req.file.path
    const image = req.file ? req.file.path : "";

    const newProduct = new Product({
      category,
      name,
      price,
      description,
      image,
    });

    await newProduct.save();

    res.status(201).json({
      message: "Product created successfully",
      product: newProduct,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error creating product",
      error: error.message,
    });
  }
});

// Get all products
router.get("/", async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error fetching products",
      error: error.message,
    });
  }
});

// Get a single product by ID
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error fetching product",
      error: error.message,
    });
  }
});

// Update a product
router.put("/:id", upload.single("image"), uploadToImageKit, async (req, res) => {
  try {
    const { category, name, price, description } = req.body;
    const image = req.file ? req.file.path : undefined; // Update image if a new one is provided

    const updatedData = {
      category,
      name,
      price,
      description,
      ...(image && { image }), // Only include image if a new one is uploaded
    };

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      updatedData,
      { new: true } // Return the updated document
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({
      message: "Product updated successfully",
      product: updatedProduct,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error updating product",
      error: error.message,
    });
  }
});

// Delete a product
router.delete("/:id", async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);

    if (!deletedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error deleting product",
      error: error.message,
    });
  }
});

module.exports = router;
