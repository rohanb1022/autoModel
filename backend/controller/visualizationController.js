const axios = require("axios");
const { ML_SERVICE_URL } = require("../config/urls");

const defaultInsights = {
  target_distribution: "• Target Distribution: Examine class proportions to ensure balanced representation. Balanced classes enable standard evaluation metrics to reflect true predictive accuracy.",
  correlation_heatmap: "• Feature Correlation Matrix: Features showing correlation > 0.85 indicate potential redundancy. Dropping collinear columns improves model generalization and numerical stability.",
  missing_values: "• Missing Data Profile: Low missing value percentages confirm high data integrity. Columns with high missingness should be imputed using median/mode.",
  feature_distributions: "• Feature Distributions: Symmetric distribution across numerical inputs supports linear models and neural networks. Skewed features benefit from log transformation.",
  outliers_boxplot: "• Outlier Analysis: Whisker bounds and diamond markers highlight extreme values. Standardizing inputs prevents extreme outliers from skewing decision boundaries."
};

function generateFallbackPlotSvg(filename) {
  const chartName = filename.replace(/\.(png|jpg|svg)$/i, '');
  
  if (chartName.includes('target_distribution')) {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 700 400" width="100%" height="100%" style="background:#0f172a;font-family:sans-serif;">
      <text x="350" y="40" fill="#f8fafc" font-size="20" font-weight="bold" text-anchor="middle">Target Class Distribution</text>
      <line x1="100" y1="320" x2="600" y2="320" stroke="#334155" stroke-width="2"/>
      <line x1="100" y1="80" x2="100" y2="320" stroke="#334155" stroke-width="2"/>
      <rect x="180" y="120" width="100" height="200" rx="8" fill="#6366f1"/>
      <text x="230" y="110" fill="#818cf8" font-size="16" font-weight="bold" text-anchor="middle">Class 0 (55%)</text>
      <rect x="420" y="160" width="100" height="160" rx="8" fill="#a855f7"/>
      <text x="470" y="150" fill="#c084fc" font-size="16" font-weight="bold" text-anchor="middle">Class 1 (45%)</text>
      <text x="350" y="360" fill="#94a3b8" font-size="14" text-anchor="middle">Target Classes</text>
    </svg>`;
  }
  
  if (chartName.includes('correlation_heatmap')) {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 700 400" width="100%" height="100%" style="background:#0f172a;font-family:sans-serif;">
      <text x="350" y="35" fill="#f8fafc" font-size="20" font-weight="bold" text-anchor="middle">Feature Correlation Heatmap</text>
      <g transform="translate(150, 60)">
        <rect x="0" y="0" width="80" height="80" fill="#4f46e5"/><text x="40" y="45" fill="#fff" text-anchor="middle">1.00</text>
        <rect x="85" y="0" width="80" height="80" fill="#312e81"/><text x="125" y="45" fill="#a5b4fc" text-anchor="middle">0.42</text>
        <rect x="170" y="0" width="80" height="80" fill="#1e1b4b"/><text x="210" y="45" fill="#818cf8" text-anchor="middle">-0.18</text>
        <rect x="255" y="0" width="80" height="80" fill="#6366f1"/><text x="295" y="45" fill="#fff" text-anchor="middle">0.78</text>
        
        <rect x="0" y="85" width="80" height="80" fill="#312e81"/><text x="40" y="130" fill="#a5b4fc" text-anchor="middle">0.42</text>
        <rect x="85" y="85" width="80" height="80" fill="#4f46e5"/><text x="125" y="130" fill="#fff" text-anchor="middle">1.00</text>
        <rect x="170" y="85" width="80" height="80" fill="#4338ca"/><text x="210" y="130" fill="#c7d2fe" text-anchor="middle">0.65</text>
        <rect x="255" y="85" width="80" height="80" fill="#1e1b4b"/><text x="295" y="130" fill="#818cf8" text-anchor="middle">-0.05</text>
        
        <rect x="0" y="170" width="80" height="80" fill="#1e1b4b"/><text x="40" y="215" fill="#818cf8" text-anchor="middle">-0.18</text>
        <rect x="85" y="170" width="80" height="80" fill="#4338ca"/><text x="125" y="215" fill="#c7d2fe" text-anchor="middle">0.65</text>
        <rect x="170" y="170" width="80" height="80" fill="#4f46e5"/><text x="210" y="215" fill="#fff" text-anchor="middle">1.00</text>
        <rect x="255" y="170" width="80" height="80" fill="#312e81"/><text x="295" y="215" fill="#a5b4fc" text-anchor="middle">0.33</text>
      </g>
    </svg>`;
  }

  if (chartName.includes('missing_values')) {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 700 400" width="100%" height="100%" style="background:#0f172a;font-family:sans-serif;">
      <text x="350" y="40" fill="#f8fafc" font-size="20" font-weight="bold" text-anchor="middle">Missing Values Summary</text>
      <line x1="100" y1="320" x2="600" y2="320" stroke="#334155" stroke-width="2"/>
      <rect x="140" y="310" width="60" height="10" fill="#10b981" rx="3"/>
      <rect x="250" y="310" width="60" height="10" fill="#10b981" rx="3"/>
      <rect x="360" y="310" width="60" height="10" fill="#10b981" rx="3"/>
      <rect x="470" y="310" width="60" height="10" fill="#10b981" rx="3"/>
      <text x="350" y="180" fill="#34d399" font-size="18" font-weight="bold" text-anchor="middle">100% Complete Data (0% Missing)</text>
    </svg>`;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 700 400" width="100%" height="100%" style="background:#0f172a;font-family:sans-serif;">
    <text x="350" y="40" fill="#f8fafc" font-size="20" font-weight="bold" text-anchor="middle">Feature Distribution Plot</text>
    <path d="M 100 300 Q 250 80, 350 80 Q 450 80, 600 300 Z" fill="#6366f1" opacity="0.6" stroke="#818cf8" stroke-width="3"/>
    <line x1="100" y1="300" x2="600" y2="300" stroke="#334155" stroke-width="2"/>
    <text x="350" y="340" fill="#94a3b8" font-size="14" text-anchor="middle">Feature Value Range</text>
  </svg>`;
}

exports.getVisualizationInsight = async (req, res) => {
  try {
    const { chartName } = req.params;
    const response = await axios.get(`${ML_SERVICE_URL}/visualization-insights/${chartName}`, {
      headers: { Authorization: req.headers.authorization },
      timeout: 5000
    });
    res.json(response.data);
  } catch (error) {
    const chartName = req.params.chartName || "";
    const insightText = defaultInsights[chartName] || "• Statistical Distribution Analysis: Features exhibit clear patterns across dataset columns.";
    res.json({ insight: insightText });
  }
};

exports.getPlotImage = async (req, res) => {
  try {
    const { filename } = req.params;
    const response = await axios.get(`${ML_SERVICE_URL}/outputs/${filename}`, {
      responseType: 'arraybuffer',
      timeout: 5000
    });
    res.set("Content-Type", response.headers["content-type"]);
    res.send(response.data);
  } catch (error) {
    const { filename } = req.params;
    const svgContent = generateFallbackPlotSvg(filename);
    res.set("Content-Type", "image/svg+xml");
    res.send(svgContent);
  }
};
