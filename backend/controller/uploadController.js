const axios = require("axios");
const fs = require("fs");
const mongoose = require("mongoose");
const { GridFSBucket } = require("mongodb");
const { ML_SERVICE_URL } = require("../config/urls");
const { logError } = require("../utils/errorLogger.js");

exports.uploadDataset = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const filePath = req.file.path;
    const token = req.headers.authorization;
    
    if (!mongoose.connection.db) {
      return res.status(500).json({ error: "Database connection not ready" });
    }

    // 1. Upload to GridFS
    const bucket = new GridFSBucket(mongoose.connection.db, { bucketName: 'datasets' });
    const uploadStream = bucket.openUploadStream(req.file.originalname, {
      metadata: { userId: req.user._id }
    });
    
    const readStream = fs.createReadStream(filePath);
    readStream.pipe(uploadStream);

    uploadStream.on('error', (error) => {
      console.error("[GRIDFS UPLOAD ERROR]:", error);
      logError("GRIDFS UPLOAD ERROR", error);
      res.status(500).json({ error: "Failed to store dataset securely." });
    });

    uploadStream.on('finish', async () => {
      const datasetId = uploadStream.id.toString();
      
      // 2. Call ML Service /analyze with dataset_id
      try {
        console.log(`[UPLOAD] Calling ML service: ${ML_SERVICE_URL}/analyze with dataset_id=${datasetId}`);
        const response = await fetch(`${ML_SERVICE_URL}/analyze`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": token || "",
          },
          body: JSON.stringify({ dataset_id: datasetId, dataset_name: req.file.originalname })
        });
        
        let mlData;
        try {
          mlData = await response.json();
        } catch (e) {
          throw new Error(`Failed to parse ML response (HTTP ${response.status})`);
        }

        console.log(`[UPLOAD] ML service responded with status ${response.status}:`, JSON.stringify(mlData).substring(0, 300));

        // Treat both HTTP errors AND ML-level errors (200 + {error:...}) as failures
        if (!response.ok || mlData.error) {
          const errMsg = mlData.error || mlData.detail || "ML service error";
          return res.status(response.ok ? 422 : response.status).json({
            error: "ML Analysis failed.",
            details: errMsg
          });
        }
        
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
        
        mlData.dataset_id = datasetId;
        res.json(mlData);

      } catch (mlError) {
        console.error("[ML ANALYZE ERROR]:", mlError.response?.data || mlError.message);
        logError("ML ANALYZE ERROR", mlError);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
        res.status(mlError.response?.status || 500).json({
          error: "ML Analysis failed.",
          details: mlError.response?.data || mlError.message
        });
      }
    });

  } catch (error) {
    console.error("[UPLOAD ERROR]:", error.message);
    logError("UPLOAD ERROR", error);
    res.status(500).json({ error: "Dataset upload failed." });
  }
};