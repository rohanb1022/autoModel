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
      
      // 2. Call ML Service /analyze with dataset_id (with retry for HF space cold starts)
      try {
        console.log(`[UPLOAD] Calling ML service: ${ML_SERVICE_URL}/analyze with dataset_id=${datasetId}`);
        
        let response;
        let responseText = "";
        let mlData = null;
        let attempts = 0;
        const maxAttempts = 3;

        while (attempts < maxAttempts) {
          attempts++;
          try {
            response = await fetch(`${ML_SERVICE_URL}/analyze`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": token || "",
              },
              body: JSON.stringify({ dataset_id: datasetId, dataset_name: req.file.originalname })
            });

            responseText = await response.text();
            
            try {
              mlData = JSON.parse(responseText);
            } catch (e) {
              mlData = null;
            }

            // If success or valid JSON response received, exit retry loop
            if (response.ok && mlData) {
              break;
            }

            // If 502/503/504 or non-JSON HTML (HF space waking up), wait & retry
            if ([502, 503, 504].includes(response.status) || (!mlData && attempts < maxAttempts)) {
              console.warn(`[UPLOAD] ML service attempt ${attempts}/${maxAttempts} returned HTTP ${response.status}. Retrying in 4s...`);
              await new Promise((r) => setTimeout(r, 4000));
              continue;
            }

            break;
          } catch (netErr) {
            console.warn(`[UPLOAD] Network error on attempt ${attempts}/${maxAttempts}: ${netErr.message}`);
            if (attempts < maxAttempts) {
              await new Promise((r) => setTimeout(r, 4000));
            } else {
              throw netErr;
            }
          }
        }

        console.log(`[UPLOAD] ML service responded with status ${response?.status}:`, mlData ? JSON.stringify(mlData).substring(0, 300) : responseText.substring(0, 300));

        if (!response || !response.ok || (mlData && mlData.error)) {
          const errMsg = mlData?.error || mlData?.detail || `ML service unavailable or error (HTTP ${response?.status || 500})`;
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
          return res.status(response?.ok ? 422 : (response?.status || 500)).json({
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
          details: mlError.response?.data?.details || mlError.response?.data?.error || mlError.message
        });
      }
    });

  } catch (error) {
    console.error("[UPLOAD ERROR]:", error.message);
    logError("UPLOAD ERROR", error);
    res.status(500).json({ error: "Dataset upload failed." });
  }
};