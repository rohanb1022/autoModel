const axios = require("axios");
const { ML_SERVICE_URL } = require("../config/urls");

exports.getVisualizationInsight = async (req, res) => {
  try {
    const { chartName } = req.params;
    const response = await axios.get(`${ML_SERVICE_URL}/visualization-insights/${chartName}`, {
      headers: { Authorization: req.headers.authorization }
    });
    res.json(response.data);
  } catch (error) {
    console.error(`VISUALIZATION INSIGHT ERROR (${req.params.chartName}):`, error.message);
    res.json({ insight: "• AI is currently analyzing this chart's patterns..." });
  }
};

exports.getPlotImage = async (req, res) => {
  try {
    const { filename } = req.params;
    const response = await axios.get(`${ML_SERVICE_URL}/outputs/${filename}`, {
      responseType: 'arraybuffer'
    });
    res.set("Content-Type", response.headers["content-type"]);
    res.send(response.data);
  } catch (error) {
    console.error(`PLOT IMAGE PROXY ERROR (${req.params.filename}):`, error.message);
    res.status(404).send("Plot not found");
  }
};
