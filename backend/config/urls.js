/**
 * Backend API Configuration
 * Manages locations of internal services (like the ML service)
 */

const isProduction = process.env.NODE_ENV === "production";

// Use a custom environment variable if you want to force local ML even in production
// or vice versa. Default: local during development, HF Spaces in production.
const LOCAL_ML_URL = "http://localhost:8000";
const PRODUCTION_ML_URL = process.env.ML_BACKEND_URL || "https://rohan1022-automodel-ml-2ad7e84.hf.space";

const URLS = {
  // Flag to manually switch between local/production for testing
  USE_LOCAL_ML: !isProduction, 
  
  // The actual URL being used
  get ML_SERVICE_URL() {
    return this.USE_LOCAL_ML ? LOCAL_ML_URL : PRODUCTION_ML_URL;
  }
};

module.exports = URLS;
