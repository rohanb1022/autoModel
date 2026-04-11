const express = require("express");
const { registerUser, loginUser } = require("../controller/authController.js");
const protect = require("../middleware/authMiddleware.js");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);

// test protected route
router.get("/me", protect, (req, res) => {
    res.json(req.user);
});

module.exports = router;
