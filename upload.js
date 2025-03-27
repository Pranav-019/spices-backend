const multer = require("multer");
const imagekit = require("./imageKit"); // Import ImageKit configuration

// Set up multer to store images in memory
const storage = multer.memoryStorage();

// Initialize multer with memory storage
const upload = multer({ storage: storage });

// Middleware to upload image to ImageKit
const uploadToImageKit = (req, res, next) => {
  if (!req.file) return next(); // Proceed if no file is uploaded

  // Upload the file buffer to ImageKit
  imagekit
    .upload({
      file: req.file.buffer, // Buffer of the uploaded file
      fileName: req.file.originalname, // Use the original file name
    })
    .then((result) => {
      // Store the URL of the uploaded image from ImageKit
      req.file.path = result.url; // URL of the uploaded image
      next(); // Proceed to the next middleware or route handler
    })
    .catch((error) => {
      // Handle any errors that occur during the upload process
      return res.status(500).json({ error: "ImageKit upload failed", details: error });
    });
};

module.exports = { upload, uploadToImageKit };
