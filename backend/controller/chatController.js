const axios = require("axios");
const { ML_SERVICE_URL } = require("../config/urls");
const { logError } = require("../utils/errorLogger.js");

exports.handleChat = async (req, res) => {
  try {
    const { question } = req.body;
    
    if (!question) {
      return res.status(400).json({ error: "Question is required" });
    }

    console.log("[BACKEND] Proxying chat request to ML service...");

    const response = await axios.post(
      `${ML_SERVICE_URL}/chat`,
      { question },
      {
        headers: {
          Authorization: req.headers.authorization, // Pass the same token
          "Content-Type": "application/json",
        },
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error("CHAT PROXY ERROR:", error.response?.data || error.message);
    logError("CHAT PROXY ERROR", error);
    res.status(error.response?.status || 500).json({
      error: "The AI assistant is temporarily unavailable.",
      details: error.response?.data?.detail || error.message
    });
  }
};
