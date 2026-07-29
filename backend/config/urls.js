/**
 * Backend API Configuration
 * Manages locations of internal services (like the ML service)
 */

const isProduction = process.env.NODE_ENV === "production";

const rawMlUrl = (process.env.ML_BACKEND_URL || "").trim();
const defaultProdUrl = "https://rohan1022-automodel-ml.hf.space";
const defaultLocalUrl = "http://localhost:8000";

// Determine effective ML URL
let targetUrl = defaultLocalUrl;
if (isProduction) {
  targetUrl = rawMlUrl && !rawMlUrl.includes("localhost") && !rawMlUrl.includes("127.0.0.1")
    ? rawMlUrl
    : defaultProdUrl;
} else {
  targetUrl = rawMlUrl || defaultLocalUrl;
}

// Strip trailing slash
const ML_SERVICE_URL = targetUrl.replace(/\/+$/, "");

const URLS = {
  USE_LOCAL_ML: !isProduction,
  ML_SERVICE_URL,
};

module.exports = URLS;

