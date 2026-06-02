// utils/errorLogger.js
const fs = require("fs");
const path = require("path");

function logError(title, err) {
  try {
    const logPath = path.join(__dirname, "../last_server_error.txt");
    const timestamp = new Date().toISOString();
    const stack = err?.stack || err || "No stack trace available";
    const message = err?.message || err;
    const logContent = `${timestamp}\n[${title}] ${message}\n${stack}\n\n`;
    
    fs.writeFileSync(logPath, logContent);
  } catch (e) {
    console.error("Failed to write to error log file:", e);
  }
}

module.exports = { logError };
