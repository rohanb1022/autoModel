const express = require("express");
const multer = require("multer");
const { uploadDataset } = require("../controller/uploadController");
const { confirmTarget } = require("../controller/confirmController");

const protect = require("../middleware/authMiddleware.js");

const router = express.Router();

// H1 fix: File size limit + CSV-only MIME type validation
const upload = multer({
  dest: "uploads/",
  limits: {
    fileSize: 50 * 1024 * 1024, // 50 MB max
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = ["text/csv", "application/csv", "application/vnd.ms-excel", "text/plain"];
    const allowedExts = [".csv"];
    const ext = require("path").extname(file.originalname).toLowerCase();

    if (allowedMimes.includes(file.mimetype) || allowedExts.includes(ext)) {
      cb(null, true);
    } else {
      const error = new Error("Only CSV files are allowed. Please upload a valid .csv file.");
      error.statusCode = 400;
      cb(error, false);
    }
  },
});

// STEP 1: upload + analyze dataset
router.post("/upload", protect, upload.single("file"), uploadDataset);

// STEP 2: confirm target + start training
router.post("/confirm-target", protect, confirmTarget);

module.exports = router; 
