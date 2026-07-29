const axios = require("axios");
const fs = require("fs");
const mongoose = require("mongoose");
const FormData = require("form-data");
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
      
      // 2. Call ML Service /analyze with multipart form-data (file + dataset_id)
      try {
        console.log(`[UPLOAD] Calling ML service: ${ML_SERVICE_URL}/analyze with dataset_id=${datasetId}`);
        
        let response;
        let mlData = null;
        let attempts = 0;
        const maxAttempts = 3;

        while (attempts < maxAttempts) {
          attempts++;
          try {
            const formData = new FormData();
            formData.append("file", fs.createReadStream(filePath), {
              filename: req.file.originalname,
              contentType: req.file.mimetype || 'text/csv',
            });
            formData.append("dataset_id", datasetId);
            formData.append("dataset_name", req.file.originalname);

            response = await axios.post(`${ML_SERVICE_URL}/analyze`, formData, {
              headers: {
                ...formData.getHeaders(),
                Authorization: token || "",
              },
              timeout: 120000,
            });

            mlData = response.data;
            if (response.status === 200 && mlData) {
              break;
            }
          } catch (axiosErr) {
            if (axiosErr.response) {
              response = axiosErr.response;
              mlData = axiosErr.response.data;
              console.warn(`[UPLOAD] ML service attempt ${attempts}/${maxAttempts} returned HTTP ${response.status}:`, JSON.stringify(mlData).substring(0, 200));

              // If 502/503/504 or HF space waking up, wait & retry
              if ([502, 503, 504].includes(response.status) && attempts < maxAttempts) {
                await new Promise((r) => setTimeout(r, 4000));
                continue;
              }
              break;
            } else {
              console.warn(`[UPLOAD] Network error on attempt ${attempts}/${maxAttempts}: ${axiosErr.message}`);
              if (attempts < maxAttempts) {
                await new Promise((r) => setTimeout(r, 4000));
              } else {
                throw axiosErr;
              }
            }
          }
        }

        console.log(`[UPLOAD] ML service responded with status ${response?.status}:`, mlData ? JSON.stringify(mlData).substring(0, 300) : "No data");

        if (!response || response.status !== 200 || (mlData && mlData.error)) {
          const errMsg = mlData?.error || mlData?.detail || `ML service unavailable or error (HTTP ${response?.status || 500})`;
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
          return res.status(response?.status && response.status !== 200 ? 422 : 500).json({
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