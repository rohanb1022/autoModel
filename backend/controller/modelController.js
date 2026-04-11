const ModelRun = require("../models/ModelRun.js");
const generateInsights = require("../services/geminiServices.js");


// ================= SAVE MODEL RUN =================
const saveModelRun = async (req, res) => {
  try {
    const userId = req.user._id;   // from JWT middleware

    const {
      datasetName,
      targetColumn,
      problemType,
      bestModel,
      accuracy,
      rows,
      columns,
      insights
    } = req.body;

    let finalInsights = insights;

    // If insights are missing or placeholder, generate them
    if (!finalInsights || finalInsights === "No insights available") {
        try {
            console.log("Generating insights via Gemini...");
            finalInsights = await generateInsights({
                datasetName,
                problemType,
                bestModel,
                accuracy
            });
        } catch (error) {
            console.error("Gemini generation failed:", error);
            finalInsights = "Insights generation failed";
        }
    }

    const newRun = await ModelRun.create({
      userId,
      datasetName,
      targetColumn,
      problemType,
      bestModel,
      accuracy: parseFloat(accuracy) || 0,
      rows: parseInt(rows) || 0,
      columns: parseInt(columns) || 0,
      insights: finalInsights
    });

    res.status(201).json({
      message: "Model run saved successfully",
      run: newRun
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error while saving model" });
  }
};


// ================= GET MY MODELS =================
const getMyModels = async (req, res) => {
  try {
    const userId = req.user._id;

    const models = await ModelRun.find({ userId })
      .sort({ createdAt: -1 });

    res.json(models);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching models" });
  }
};

module.exports = {
  saveModelRun,
  getMyModels
};
