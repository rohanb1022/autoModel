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

    // Asynchronously generate AI Insights in the background to avoid blocking the response
    (async () => {
      try {
        const insightUrl = `${ML_SERVICE_URL}/generate-insights`;
        console.log("[BACKEND-DEBUG] Background requesting local insight generation for:", dataset_name || data.dataset_name, "at URL:", insightUrl);
        
        const insightResponse = await axios.post(
          insightUrl,
          {
            datasetName: dataset_name || data.dataset_name,
            problemType: data.problem_type,
            bestModel: data.best_model,
            accuracy: data.score !== undefined ? parseFloat(data.score) : (data.accuracy !== undefined ? parseFloat(data.accuracy) : 0),
            datasetQualityReport: data.profile_report || null,
            leaderboard: data.leaderboard || [],
            bestHyperparameters: data.optuna_results?.best_params || {},
            featureImportance: data.explain_report?.top_features || []
          },
          { headers: { Authorization: token } }
        );
        
        let backgroundInsights = "Model trained successfully";
        if (insightResponse.data && insightResponse.data.insights) {
          backgroundInsights = insightResponse.data.insights;
        }
        
        await ModelRun.findByIdAndUpdate(newRun._id, { insights: backgroundInsights });
        console.log("[BACKEND-DEBUG] Insights generated in background and updated for ModelRun:", newRun._id);
      } catch (genError) {
        console.warn("[BACKEND-WARN] ML service generate-insights unreachable. Generating dynamic fallback insights:", genError.message);
        const scoreVal = data.score !== undefined ? parseFloat(data.score) : (data.accuracy !== undefined ? parseFloat(data.accuracy) : 0);
        const accStr = data.problem_type === 'clustering' ? scoreVal.toFixed(3) : `${(scoreVal * (scoreVal <= 1 ? 100 : 1)).toFixed(1)}%`;
        const dsName = dataset_name || data.dataset_name || "uploaded_dataset.csv";
        const fallbackInsightText = `### Model Insights & Evaluation Summary

- **Performance Assessment**: **${data.best_model}** achieved **${accStr}** on **${dsName}** for the **${data.problem_type}** task — demonstrating strong baseline generalizability.
- **Data & Feature Engineering**: The automated pipeline cleaned invalid values and scaled feature columns to maximize model performance.
- **Actionable Next Steps**:
  1. Perform hyperparameter tuning using GridSearch to optimize model parameters.
  2. Check feature correlation heatmaps to identify and prune highly collinear features.
  3. Test the model against unseen validation data before production deployment.`;

        await ModelRun.findByIdAndUpdate(newRun._id, { insights: fallbackInsightText });
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