const axios = require("axios");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { ML_SERVICE_URL } = require("../config/urls");
const { logError } = require("../utils/errorLogger.js");
const ModelRun = require("../models/ModelRun.js");

exports.handleChat = async (req, res) => {
  try {
    const { question } = req.body;
    
    if (!question) {
      return res.status(400).json({ error: "Question is required" });
    }

    // 1. Try ML Service /chat first if available
    try {
      const response = await axios.post(
        `${ML_SERVICE_URL}/chat`,
        { question },
        {
          headers: {
            Authorization: req.headers.authorization,
            "Content-Type": "application/json",
          },
          timeout: 10000,
        }
      );

      if (response.data && response.data.response) {
        return res.json(response.data);
      }
    } catch (mlErr) {
      // ML Service endpoint down or 404 - handle locally seamlessly
    }

    // 2. Direct AI Generation using Gemini with User's MongoDB Context
    const userId = req.user ? req.user._id : null;
    const lastRun = userId ? await ModelRun.findOne({ userId }).sort({ createdAt: -1 }) : null;

    const keys = [
      process.env.GEMINI_API_KEY,
      process.env.GEMINI_API_KEY_2,
      process.env.GEMINI_API_KEY_3,
    ].filter(Boolean);

    if (keys.length > 0) {
      let contextStr = "No dataset trained yet.";
      if (lastRun) {
        const scoreVal = lastRun.accuracy || 0;
        const accStr = lastRun.problemType === 'clustering' ? scoreVal.toFixed(3) : `${(scoreVal * (scoreVal <= 1 ? 100 : 1)).toFixed(1)}%`;
        contextStr = `Dataset Name: ${lastRun.datasetName}, Best Model: ${lastRun.bestModel}, Score: ${accStr}, Target Column: ${lastRun.targetColumn}, Problem Type: ${lastRun.problemType}, Rows: ${lastRun.rows}, Columns: ${lastRun.columns}`;
        if (lastRun.topFeatures && lastRun.topFeatures.length > 0) {
          contextStr += `, Top Features: ${lastRun.topFeatures.slice(0, 5).join(', ')}`;
        }
      }

      const prompt = `You are an expert AI Data Assistant on the AutoModel machine learning platform.
User's Dataset & Trained Model Context:
${contextStr}

User Question: ${question}

RULES:
1. Answer the user's question accurately based on their dataset context if provided.
2. If the user asks general ML questions, give a clear, professional, concise answer.
3. Use clean markdown formatting (bullet points, bold text).`;

      for (const key of keys) {
        try {
          const genAI = new GoogleGenerativeAI(key);
          const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
          const result = await model.generateContent(prompt);
          const resText = await result.response.text();
          if (resText && resText.trim()) {
            return res.json({ response: resText.trim() });
          }
        } catch (e) {
          console.warn(`[CHAT] Gemini key failed: ${e.message}. Trying next key...`);
        }
      }
    }

    // 3. Guaranteed Rule-Based Fallback Engine (Zero API calls required)
    const qLower = question.toLowerCase();
    let answer = "";

    if (lastRun) {
      const dataset = lastRun.datasetName || "your dataset";
      const model = lastRun.bestModel || "trained model";
      const scoreVal = lastRun.accuracy || 0;
      const accStr = lastRun.problemType === 'clustering' ? scoreVal.toFixed(3) : `${(scoreVal * (scoreVal <= 1 ? 100 : 1)).toFixed(1)}%`;
      const target = lastRun.targetColumn || "target column";
      const ptype = lastRun.problemType || "classification";

      if (qLower.includes("accuracy") || qLower.includes("score") || qLower.includes("performance") || qLower.includes("result")) {
        answer = `For your dataset **${dataset}**, the trained **${model}** achieved a score of **${accStr}** on predicting \`${target}\` (${ptype} task).`;
      } else if (qLower.includes("best model") || qLower.includes("algo") || qLower.includes("algorithm") || qLower.includes("priority")) {
        answer = `Based on automated pipeline evaluation for **${dataset}**, **${model}** was selected as the best performing algorithm with **${accStr}** score.`;
      } else if (qLower.includes("column") || qLower.includes("feature")) {
        const topFeats = lastRun.topFeatures && lastRun.topFeatures.length > 0 ? `\nTop features include: ${lastRun.topFeatures.slice(0, 5).join(", ")}.` : "";
        answer = `Your dataset **${dataset}** was trained with target column \`${target}\`.${topFeats}`;
      } else if (qLower.includes("dataset") || qLower.includes("rows") || qLower.includes("shape")) {
        answer = `**${dataset}** contains ${lastRun.rows || "N/A"} rows and ${lastRun.columns || "N/A"} columns. Target column: \`${target}\`.`;
      } else if (qLower.includes("hello") || qLower.includes("hi") || qLower.includes("hey")) {
        answer = `Hello! I'm your AutoModel data assistant. I can see you trained a **${model}** model on **${dataset}** (${accStr} score). Ask me anything about your results!`;
      } else {
        answer = `Regarding **${dataset}**: The winning model **${model}** achieved **${accStr}** accuracy on predicting target column \`${target}\` (${ptype}).`;
      }
    } else {
      answer = "Hello! I'm your AutoModel AI assistant. Upload a dataset and train a model, then I can answer detailed questions about your accuracy, top models, and feature importance!";
    }

    return res.json({ response: answer });

  } catch (error) {
    console.error("CHAT PROXY ERROR:", error.message);
    logError("CHAT PROXY ERROR", error);
    return res.json({
      response: "Hi! I'm your data assistant. Ask me anything about your uploaded datasets and trained models!"
    });
  }
};
