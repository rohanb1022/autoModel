const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");
const dns = require("dns");

dns.setDefaultResultOrder("ipv4first");
dotenv.config({ path: path.join(__dirname, "../backend/.env") });

const ModelRun = require("../backend/models/ModelRun.js");

async function check() {
  try {
    console.log("Connecting to:", process.env.MONGO_URI);
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected successfully!");

    const runs = await ModelRun.find().sort({ createdAt: -1 }).limit(3);
    console.log("\nLast 3 Model Runs:\n");
    console.log(JSON.stringify(runs, null, 2));

    process.exit(0);
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
}

check();
