const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const modelRoutes = require("./routes/modelRoutes.js");

PORT = process.env.PORT || 5000;


const app = express();
app.use(cors());
app.use(express.json());

const generateInsights = require("./services/geminiServices");

app.get("/ai-test", async (req,res)=>{
  const result = await generateInsights({
    datasetName:"test.csv",
    problemType:"classification",
    bestModel:"Random Forest",
    accuracy:0.45
  });

  res.send(result);
});


const messageRoutes = require("./routes/messageRoutes");
const paymentRoutes = require("./routes/paymentRoutes");

app.use("/api", uploadRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/models", modelRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/payment", paymentRoutes);

app.get("/", (req, res) => {
  res.send("Node backend running");
});

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
  connectDB();
});
