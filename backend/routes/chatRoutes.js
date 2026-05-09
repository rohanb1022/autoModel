const express = require("express");
const { handleChat } = require("../controller/chatController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, handleChat);

module.exports = router;
