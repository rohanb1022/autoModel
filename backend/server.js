const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const modelRoutes = require("./routes/modelRoutes.js");

const PORT = process.env.PORT || 5000;
const IS_PRODUCTION = process.env.NODE_ENV === "production";

const app = express();

// Production-safe CORS: explicitly allow only frontend + ML backend origins
const allowedOrigins = [
  "http://localhost:8080",
  "http://localhost:5173",
  "http://localhost:3000",
  // Add your deployed Vercel frontend URL here:
  process.env.FRONTEND_URL,
  // HuggingFace Space (ML backend may call Node in some flows)
  "https://rohan1022-automodel-ml.hf.space",
].filter(Boolean); // Remove undefined entries

app.use(
  cors({
    origin: IS_PRODUCTION
      ? (origin, callback) => {
          if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
          } else {
            callback(new Error(`CORS blocked: ${origin}`));
          }
        }
      : true, // Allow all origins in development
    credentials: true,
  })
);
app.use(express.json({ limit: "1mb" })); // Body size cap

// Trust proxy required for Render and express-rate-limit to work properly
app.set("trust proxy", 1);

// ── Rate Limiting (M1 fix) ─────────────────────────────────────────────────
const rateLimit = require("express-rate-limit");

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,                   // 10 login/register attempts per window
  message: { error: "Too many requests from this IP, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: "Upload rate limit exceeded. Please wait before uploading again." },
  standardHeaders: true,
  legacyHeaders: false,
});

const generalLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60,                   // 60 general requests per minute
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(generalLimiter); // Apply general limit to all routes

// ── Routes ─────────────────────────────────────────────────────────────────
const messageRoutes = require("./routes/messageRoutes");
const paymentRoutes = require("./routes/paymentRoutes");

// NOTE: /ai-test debug route has been removed (was unauthenticated, consumed Gemini quota)

const chatRoutes = require("./routes/chatRoutes");

app.use("/api", uploadLimiter, uploadRoutes);
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/models", modelRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/chat", chatRoutes);

app.get("/", (req, res) => {
  res.send("AutoModel API running");
});

// ── Global error handler ────────────────────────────────────────────────────
// H2 fix: Never leak stack traces or internal error details to clients
app.use((err, req, res, next) => {
  console.error("[ERROR]", err.stack);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    error: IS_PRODUCTION
      ? "An internal server error occurred."
      : err.message,
  });
});

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
  connectDB();
});
