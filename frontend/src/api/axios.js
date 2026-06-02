import axios from "axios";
import { BASE_API_URL } from "../config/urls";

const API = axios.create({
  baseURL: BASE_API_URL,
});

// ── Retry config for 429 errors ──────────────────────────────────────────────
const MAX_RETRIES = 3;
const BASE_DELAY_MS = 1000; // 1 second

function getRetryDelay(retryCount, retryAfterHeader) {
  // Respect server's Retry-After header if present
  if (retryAfterHeader) {
    const seconds = parseInt(retryAfterHeader, 10);
    if (!isNaN(seconds)) return seconds * 1000;
  }
  // Exponential backoff: 1s, 2s, 4s
  return BASE_DELAY_MS * Math.pow(2, retryCount);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ── Request interceptor: attach auth token ───────────────────────────────────
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

// ── Response interceptor: auto-retry on 429, auto-logout on 401 ─────────────
API.interceptors.response.use(
  (res) => res,
  async (err) => {
    const config = err.config;

    // Auto logout on 401
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
      return Promise.reject(err);
    }

    // Auto-retry on 429 (Too Many Requests)
    if (err.response?.status === 429) {
      // Track retry count on the request config
      config._retryCount = config._retryCount || 0;

      if (config._retryCount < MAX_RETRIES) {
        config._retryCount += 1;
        const delay = getRetryDelay(
          config._retryCount - 1,
          err.response.headers["retry-after"]
        );
        console.warn(
          `[API] 429 received for ${config.url} — retrying (${config._retryCount}/${MAX_RETRIES}) in ${delay}ms`
        );
        await sleep(delay);
        return API(config); // Retry the request
      }

      console.error(
        `[API] 429 for ${config.url} — all ${MAX_RETRIES} retries exhausted`
      );
    }

    return Promise.reject(err);
  }
);

export default API;
