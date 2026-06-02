const express = require("express");
const { downloadDataset } = require("../controller/datasetController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/:id/download", protect, downloadDataset);

module.exports = router;
