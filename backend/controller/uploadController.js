const axios = require("axios");
const fs = require("fs");
const mongoose = require("mongoose");
const { GridFSBucket } = require("mongodb");
const { ML_SERVICE_URL } = require("../config/urls");

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
      res.status(500).json({ error: "Failed to store dataset securely." });
    });

    uploadStream.on('finish', async () => {
      const datasetId = uploadStream.id.toString();
      
      // 2. Call ML Service /analyze with dataset_id
      try {
        const response = await axios.post(
          `${ML_SERVICE_URL}/analyze`,
          { dataset_id: datasetId, dataset_name: req.file.originalname },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: token,
            },
          }
        );
        
        fs.unlinkSync(filePath); // delete local temp file on node
        
        // Add dataset_id to response so frontend can use it if needed
        const mlData = response.data;
        mlData.dataset_id = datasetId;
        
        res.json(mlData);
      } catch (mlError) {
        console.error("[ML ANALYZE ERROR]:", mlError.response?.data || mlError.message);
        fs.unlinkSync(filePath);
        res.status(mlError.response?.status || 500).json({
          error: "ML Analysis failed.",
          details: mlError.response?.data || mlError.message
        });
      }
    });

  } catch (error) {
    console.error("[UPLOAD ERROR]:", error.message);
    res.status(500).json({ error: "Dataset upload failed." });
  }
};