const express = require("express");
const router = express.Router();
const { createOrder, verifyPayment } = require("../controller/paymentController");
const protect = require("../middleware/authMiddleware");

// Both routes require authentication — userId comes from JWT token, not request body
router.post("/create-order", protect, createOrder);
router.post("/verify-payment", protect, verifyPayment);

module.exports = router;
