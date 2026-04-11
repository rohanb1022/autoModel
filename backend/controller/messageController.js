const axios = require("axios");
const SystemMessage = require("../models/SystemMessage");
const User = require("../models/User");
const { getHelpFromModel } = require("../services/geminiServices");
const { ML_SERVICE_URL } = require("../config/urls");

exports.getMessages = async (req, res) => {
  try {
    const messages = await SystemMessage.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(messages);
  } catch (error) {
    console.error("GET MESSAGES ERROR:", error.message);
    res.status(500).json({ error: "Failed to fetch system messages" });
  }
};

exports.getAIAdvice = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(req.user._id);

    if (!user.isSubscribed) {
      return res.status(403).json({ error: "Subscription required for AI Helper." });
    }

    const message = await SystemMessage.findById(id);
    if (!message) return res.status(404).json({ error: "Message not found." });

    // 1. Get sample data from ML service
    let sampleData = "No sample data available";
    try {
      const mlResponse = await axios.get(`${ML_SERVICE_URL}/sample-data`, {
        headers: { Authorization: req.headers.authorization }
      });
      sampleData = mlResponse.data.sample || "No sample records available";
    } catch (err) {
      console.warn("Could not fetch sample data from ML Service:", err.message);
    }

    // 2. Call Gemini
    const advice = await getHelpFromModel(message.traceback || message.content, sampleData);

    // 3. Cache it
    message.aiAdvice = advice;
    await message.save();

    res.json({ advice });
  } catch (error) {
    console.error("AI ADVICE ERROR:", error.message);
    res.status(500).json({ error: "Failed to generate AI advice" });
  }
};
