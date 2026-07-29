const axios = require("axios");
const { ML_SERVICE_URL } = require("../config/urls");
const { logError } = require("../utils/errorLogger.js");
const ModelRun = require("../models/ModelRun.js");

async function callGeminiRest(prompt) {
  const keys = [
    process.env.GEMINI_API_KEY,
    process.env.GEMINI_API_KEY_2,
    process.env.GEMINI_API_KEY_3,
    process.env.GEMINI_API_KEY_4
  ].filter(Boolean);

  const models = ["gemini-2.0-flash", "gemini-1.5-flash"];

  for (const key of keys) {
    for (const model of models) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
        const res = await axios.post(
          url,
          {
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.3, maxOutputTokens: 1024 }
          },
          { timeout: 10000 }
        );

        if (res.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
          return res.data.candidates[0].content.parts[0].text.trim();
        }
      } catch (err) {
        // Try next model/key
      }
    }
  }
  return null;
}

exports.handleChat = async (req, res) => {
  try {
    const { question } = req.body;
    
    if (!question || typeof question !== "string" || !question.trim()) {
      return res.status(400).json({ error: "Question is required" });
    }

    const cleanQuestion = question.trim();

    // Fetch user's latest model run from MongoDB to provide accurate dataset context
    const userId = req.user ? req.user._id : null;
    const lastRun = userId ? await ModelRun.findOne({ userId }).sort({ createdAt: -1 }) : null;

    let contextStr = "No dataset trained yet by this user.";
    if (lastRun) {
      const scoreVal = lastRun.accuracy || 0;
      const accStr = lastRun.problemType === 'clustering' 
        ? scoreVal.toFixed(3) 
        : `${(scoreVal * (scoreVal <= 1 ? 100 : 1)).toFixed(1)}%`;

      contextStr = [
        `Dataset Name: ${lastRun.datasetName || "N/A"}`,
        `Best Model: ${lastRun.bestModel || "N/A"}`,
        `Score/Accuracy: ${accStr}`,
        `Target Column: ${lastRun.targetColumn || "N/A"}`,
        `Problem Type: ${lastRun.problemType || "N/A"}`,
        `Rows: ${lastRun.rows || "N/A"}`,
        `Columns: ${lastRun.columns || "N/A"}`,
        lastRun.topFeatures && lastRun.topFeatures.length > 0 ? `Top Features: ${lastRun.topFeatures.slice(0, 5).join(', ')}` : null
      ].filter(Boolean).join("\n");
    }

    // 1. Primary: Direct Gemini REST API with Dataset Context
    const systemPrompt = `You are an expert AI Data Scientist Assistant in the AutoModel platform.
Help users analyze their dataset and model performance.

=== USER'S LATEST DATASET & MODEL CONTEXT ===
${contextStr}

RULES:
- If the user asks about their accuracy, dataset, model, columns, or performance, answer accurately using the Context.
- If the user asks general machine learning or data science questions, provide a clear, professional, concise response.
- Format responses cleanly using markdown (bullet points, bold text).`;

    const aiResponse = await callGeminiRest(`${systemPrompt}\n\n=== USER QUESTION ===\n${cleanQuestion}`);

    if (aiResponse) {
      return res.json({ response: aiResponse });
    }

    // 2. Secondary: ML Service Proxy fallback
    try {
      const mlResponse = await axios.post(
        `${ML_SERVICE_URL}/chat`,
        { question: cleanQuestion },
        {
          headers: {
            Authorization: req.headers.authorization || "",
            "Content-Type": "application/json",
          },
          timeout: 8000,
        }
      );

      if (mlResponse.data?.response) {
        return res.json({ response: mlResponse.data.response });
      }
    } catch (mlErr) {
      // ML service unavailable
    }

    // 3. Guaranteed Rule-Based Engine (Zero-failure fallback, 0 API calls required)
    const qLower = cleanQuestion.toLowerCase();
    let fallbackAnswer = "";

    if (lastRun) {
      const dataset = lastRun.datasetName || "your dataset";
      const model = lastRun.bestModel || "trained model";
      const scoreVal = lastRun.accuracy || 0;
      const accStr = lastRun.problemType === 'clustering' ? scoreVal.toFixed(3) : `${(scoreVal * (scoreVal <= 1 ? 100 : 1)).toFixed(1)}%`;
      const target = lastRun.targetColumn || "target column";
      const ptype = lastRun.problemType || "classification";

      if (qLower.includes("accuracy") || qLower.includes("score") || qLower.includes("performance") || qLower.includes("result")) {
        fallbackAnswer = `For your dataset **${dataset}**, the trained **${model}** achieved a score of **${accStr}** on predicting \`${target}\` (${ptype} task).`;
      } else if (qLower.includes("best model") || qLower.includes("algo") || qLower.includes("algorithm") || qLower.includes("priority")) {
        fallbackAnswer = `Based on automated pipeline evaluation for **${dataset}**, **${model}** was selected as the best performing algorithm with **${accStr}** score.`;
      } else if (qLower.includes("column") || qLower.includes("feature")) {
        const topFeats = lastRun.topFeatures && lastRun.topFeatures.length > 0 ? `\nTop features include: ${lastRun.topFeatures.slice(0, 5).join(", ")}.` : "";
        fallbackAnswer = `Your dataset **${dataset}** was trained with target column \`${target}\`.${topFeats}`;
      } else if (qLower.includes("dataset") || qLower.includes("rows") || qLower.includes("shape")) {
        fallbackAnswer = `**${dataset}** contains ${lastRun.rows || "N/A"} rows and ${lastRun.columns || "N/A"} columns. Target column: \`${target}\`.`;
      } else if (qLower.includes("hello") || qLower.includes("hi") || qLower.includes("hey")) {
        fallbackAnswer = `Hello! I'm your AutoModel data assistant. I can see you trained a **${model}** model on **${dataset}** (${accStr} score). Ask me anything about your results!`;
      } else {
        fallbackAnswer = `Regarding **${dataset}**: The winning model **${model}** achieved **${accStr}** accuracy on predicting target column \`${target}\` (${ptype}).`;
      }
    } else {
      fallbackAnswer = "Hello! I'm your AutoModel AI assistant. Upload a dataset and train a model, then I can answer detailed questions about your accuracy, top models, and feature importance!";
    }

    return res.json({ response: fallbackAnswer });

  } catch (error) {
    console.error("[CHAT CONTROLLER ERROR]:", error.message);
    logError("CHAT CONTROLLER ERROR", error);
    return res.json({
      response: "Hi! I'm your AutoModel data assistant. Ask me anything about your uploaded datasets and trained models!"
    });
  }
};
