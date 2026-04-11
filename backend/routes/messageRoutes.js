const { getMessages, getAIAdvice } = require("../controller/messageController");
const protect = require("../middleware/authMiddleware");
const express = require("express");

const router = express.Router();

router.get("/", protect, getMessages);
router.post("/:id/advice", protect, getAIAdvice);

module.exports = router;
