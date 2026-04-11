const Razorpay = require("razorpay");
const crypto = require("crypto");
const User = require("../models/User");

// Initialize razorpay securely with default dev fallbacks to prevent crashes
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_fallback",
    key_secret: process.env.RAZORPAY_KEY_SECRET || "fallback_secret",
});

exports.createOrder = async (req, res) => {
    try {
        const { amount, currency } = req.body;
        
        const options = {
            amount: amount * 100, // amount in smallest currency unit (paise)
            currency: currency || "INR",
            receipt: `receipt_order_${Math.floor(Math.random() * 1000)}`,
        };

        const order = await razorpay.orders.create(options);
        // Attach the key_id so the frontend can securely use it without hardcoding
        const orderResponse = {
            ...order,
            key_id: process.env.RAZORPAY_KEY_ID
        };
        res.status(200).json(orderResponse);
    } catch (error) {
        console.error("Razorpay Create Order Error:", error);
        res.status(500).json({ error: "Failed to create order" });
    }
};

exports.verifyPayment = async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            userId
        } = req.body;

        const sign = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSign = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "fallback_secret")
            .update(sign.toString())
            .digest("hex");

        if (razorpay_signature === expectedSign) {
            // Payment is verified
            // Update user's isSubscribed status
            if (userId) {
                await User.findByIdAndUpdate(userId, { isSubscribed: true });
            }
            return res.status(200).json({ message: "Payment verified successfully", success: true });
        } else {
            return res.status(400).json({ error: "Invalid signature sent!" });
        }
    } catch (error) {
        console.error("Payment Verification Error:", error);
        res.status(500).json({ error: "Internal Server Error during verification" });
    }
};
