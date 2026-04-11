const express = require("express");
const multer = require("multer");
const { uploadDataset } = require("../controller/uploadController");
const { confirmTarget } = require("../controller/confirmController");

const protect = require("../middleware/authMiddleware.js");

const router = express.Router();
const upload = multer({ dest: "uploads/" });

// STEP 1: upload + analyze dataset
router.post("/upload", protect, upload.single("file"), uploadDataset);

// STEP 2: confirm target + start training
router.post("/confirm-target", protect, confirmTarget);

module.exports = router; 
