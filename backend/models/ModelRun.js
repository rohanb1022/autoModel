const mongoose = require("mongoose");

const modelRunSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  datasetName: String,
  targetColumn: String,
  problemType: String,
  bestModel: String,
  accuracy: Number,
  rows: Number,
  columns: Number,

  insights: {
    type: String,
    default: "Pending"
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.models.ModelRun || mongoose.model("ModelRun", modelRunSchema);
