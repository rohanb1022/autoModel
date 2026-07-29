const axios = require("axios");
const ModelRun = require("../models/ModelRun.js");
const SystemMessage = require("../models/SystemMessage.js");
const { ML_SERVICE_URL } = require("../config/urls.js");
const { logError } = require("../utils/errorLogger.js");

exports.confirmTarget = async (req, res) => {
  try {
    const { target_column, dataset_name, dataset_id } = req.body;
    const token = req.headers.authorization;

    console.log(`[BACKEND] Confirming target: ${target_column} for dataset: ${dataset_name}`);

    if (!target_column) {
      return res.status(400).json({ error: "Target column is required" });
    }

    if (!dataset_id) {
      return res.status(400).json({ error: "Dataset ID is required" });
    }

    // Call ML service to confirm target and start training (with retry for HF space cold start)
    let response;
    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
      attempts++;
      try {
        response = await axios.post(
          `${ML_SERVICE_URL}/confirm-target`,
          { target_column, dataset_name, dataset_id },
          {
            headers: { Authorization: token },
            timeout: 120000, // 2 min timeout for training
          }
        );
        break;
      } catch (err) {
        if (attempts < maxAttempts && (err.code === "ECONNRESET" || err.code === "ETIMEDOUT" || err.response?.status >= 500)) {
          console.warn(`[CONFIRM TARGET] Attempt ${attempts}/${maxAttempts} failed (${err.message}). Retrying in 4s...`);
          await new Promise((r) => setTimeout(r, 4000));
        } else {
          throw err;
        }
      }
    }

    const data = response.data;
    console.log("[BACKEND] ML Service Response Data:", data);

    if (data.error) {
      console.error("[BACKEND] ML Training Error:", data.error, data.details);
      return res.status(422).json({
        error: "ML training failed",
        details: data.details || data.error
      });
    }

    // Process Auto-Heal System Messages
    const system_messages = data.system_messages || [];
    const savedMessages = [];
    for (const msg of system_messages) {
       const newMsg = await SystemMessage.create({
          userId: req.user._id,
          datasetName: dataset_name || data.dataset_name || "uploaded_dataset.csv",
          datasetId: dataset_id,
          type: msg.type || "info",
          title: msg.title || "System Alert",
          content: msg.content || "An automatic intervention occurred.",
          llmCode: msg.llmCode || "",
          traceback: msg.traceback || ""
       });
       savedMessages.push(newMsg._id);
    }

    // Save model run to MongoDB with a placeholder insight initially
    const newRun = await ModelRun.create({
      userId: req.user._id, // from protect middleware
      datasetName: dataset_name || data.dataset_name || "uploaded_dataset.csv",
      targetColumn: data.target_column,
      problemType: data.problem_type,
      bestModel: data.best_model,
      accuracy: data.score !== undefined ? parseFloat(data.score) : (data.accuracy !== undefined ? parseFloat(data.accuracy) : 0),
      rows: data.rows,
      columns: data.columns,
      leaderboard: data.leaderboard || [],
      profileReport: data.profile_report || null,
      optunaResults: data.optuna_results || null,
      explainReport: data.explain_report || null,
      topFeatures: data.explain_report?.top_features || [],
      insights: "• Insights are being generated. Check back in a moment.",
    });

    console.log("[BACKEND] Saved ModelRun with ID:", newRun._id, "Accuracy:", newRun.accuracy, "Rows:", newRun.rows);

    // Asynchronously generate AI Insights in the background using Gemini / Structured Analysis
    (async () => {
      try {
        const scoreVal = data.score !== undefined ? parseFloat(data.score) : (data.accuracy !== undefined ? parseFloat(data.accuracy) : 0);
        const accStr = data.problem_type === 'clustering' ? scoreVal.toFixed(3) : `${(scoreVal * (scoreVal <= 1 ? 100 : 1)).toFixed(1)}%`;
        const dsName = dataset_name || data.dataset_name || "uploaded_dataset.csv";

        let generatedInsights = "";
        const { GoogleGenerativeAI } = require("@google/generative-ai");
        const keys = [process.env.GEMINI_API_KEY, process.env.GEMINI_API_KEY_2].filter(Boolean);

        if (keys.length > 0) {
          const prompt = `You are a senior Machine Learning Architect. Analyze this ML training result and write a concise, professional markdown insights report for business stakeholders.

Dataset: ${dsName}
Problem Type: ${data.problem_type}
Best Model: ${data.best_model}
Score/Accuracy: ${accStr}
Rows: ${data.rows || "N/A"}, Columns: ${data.columns || "N/A"}

Provide 3-4 clear bullet points covering performance assessment, data observation, and actionable next steps.`;

          for (const key of keys) {
            try {
              const genAI = new GoogleGenerativeAI(key);
              const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
              const result = await model.generateContent(prompt);
              const text = await result.response.text();
              if (text && text.trim()) {
                generatedInsights = text.trim();
                break;
              }
            } catch (e) {
              // Try next key
            }
          }
        }

        if (!generatedInsights) {
          generatedInsights = `### Model Insights & Evaluation Summary

- **Performance Assessment**: **${data.best_model}** achieved **${accStr}** on **${dsName}** for the **${data.problem_type}** task — demonstrating strong baseline generalizability.
- **Data & Feature Engineering**: The automated pipeline cleaned invalid values and scaled feature columns to maximize model performance.
- **Actionable Next Steps**:
  1. Perform hyperparameter tuning using GridSearch to optimize model parameters.
  2. Check feature correlation heatmaps to identify and prune highly collinear features.
  3. Test the model against unseen validation data before production deployment.`;
        }

        await ModelRun.findByIdAndUpdate(newRun._id, { insights: generatedInsights });
        console.log("[BACKEND] Model insights successfully saved for ModelRun:", newRun._id);
      } catch (genError) {
        console.error("[BACKEND ERROR] Background insight generation error:", genError.message);
      }
    })();

    res.json({
      ...data,
      runId: newRun._id,
      autoHealed: system_messages.length > 0
    });

  } catch (error) {
    console.error("CONFIRM TARGET ERROR:", error.response?.data || error.message);
    logError("CONFIRM TARGET ERROR", error);
    res.status(error.response?.status || 500).json({
      error: "Training failed",
      details: error.response?.data?.details || error.response?.data?.error || error.message,
    });
  }
};