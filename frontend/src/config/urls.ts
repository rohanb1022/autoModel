/**
 * API Configuration
 * Supports automatic switching between Localhost and Production (Render/HF)
 */

const isLocal = typeof window !== "undefined" && 
  (window.location.hostname === "localhost" || 
   window.location.hostname === "127.0.0.1" || 
   window.location.hostname.startsWith("192.168."));

// Base URL for the Node.js Backend
export const BASE_API_URL = isLocal 
  ? "http://localhost:5000/api" 
  : (import.meta.env.VITE_BACKEND_URL || "https://automodel-backend.onrender.com/api");

// Base URL for the ML Backend (FastAPI)
// Currently, the Node backend proxies/calls the ML service, 
// so the frontend usually calls the Node API.
// Define this here in case you want to call ML directly from the frontend.
export const ML_API_URL = isLocal 
  ? "http://localhost:8000" 
  : (import.meta.env.VITE_ML_BACKEND_URL || "https://rohan1022-automodel-ml.hf.space");

console.log(`[CONFIG] Running in ${isLocal ? "LOCAL" : "PRODUCTION"} mode`);
console.log(`[CONFIG] Backend API: ${BASE_API_URL}`);
