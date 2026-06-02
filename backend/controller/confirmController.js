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

    // Call ML service to confirm target and start training
    const response = await axios.post(
      `${ML_SERVICE_URL}/confirm-target`,
      { target_column, dataset_name, dataset_id },
      {
        headers: {
          Authorization: token,
        },
      }
    );

    const data = response.data;
    console.log("[BACKEND] ML Service Response Data:", data);

    // Generate AI Insights from the Local ML Service (saves Gemini tokens)
    let insights = "Model trained successfully";
    try {
      const insightUrl = `${ML_SERVICE_URL}/generate-insights`;
      console.log("[BACKEND-DEBUG] Requesting local insight generation for:", dataset_name || data.dataset_name, "at URL:", insightUrl);
      
      const insightResponse = await axios.post(
        insightUrl,
        {
          datasetName: dataset_name || data.dataset_name,
          problemType: data.problem_type,
          bestModel: data.best_model,
          accuracy: data.score !== undefined ? parseFloat(data.score) : (data.accuracy !== undefined ? parseFloat(data.accuracy) : 0)
        },
        { headers: { Authorization: token } }
      );
      
      if (insightResponse.data && insightResponse.data.insights) {
        insights = insightResponse.data.insights;
      }
      
      console.log("[BACKEND-DEBUG] Insights generated successfully via Ollama:", insights.substring(0, 50) + "...");
    } catch (genError) {
      console.error("[BACKEND-ERROR] Local Insight generation failed:", genError.message);
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

    // Save model run to MongoDB
    const newRun = await ModelRun.create({
      userId: req.user._id, // from protect middleware
      datasetName: dataset_name || data.dataset_name || "uploaded_dataset.csv",
      targetColumn: data.target_column,
      problemType: data.problem_type,
      bestModel: data.best_model,
      accuracy: data.score !== undefined ? parseFloat(data.score) : (data.accuracy !== undefined ? parseFloat(data.accuracy) : 0),
      rows: data.rows,
      columns: data.columns,
      insights: insights,
    });

    console.log("[BACKEND] Saved ModelRun with ID:", newRun._id, "Accuracy:", newRun.accuracy, "Rows:", newRun.rows);

    res.json({
      ...data,
      runId: newRun._id,
      autoHealed: system_messages.length > 0
    });

  } catch (error) {
    console.error("CONFIRM TARGET ERROR:", error.message);
    logError("CONFIRM TARGET ERROR", error);
    res.status(500).json({
      error: "Training failed",
      details: error.response?.data?.details || error.message,
    });
  }
};