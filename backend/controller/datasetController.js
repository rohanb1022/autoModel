const mongoose = require("mongoose");
const { GridFSBucket, ObjectId } = require("mongodb");

exports.downloadDataset = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.connection.db) {
      return res.status(500).json({ error: "Database connection not ready" });
    }

    const bucket = new GridFSBucket(mongoose.connection.db, { bucketName: 'datasets' });
    
    // Verify file belongs to user (optional but secure)
    const files = await bucket.find({ _id: new ObjectId(id) }).toArray();
    if (!files || files.length === 0) {
      return res.status(404).json({ error: "Dataset not found." });
    }
    
    // Check ownership
    if (files[0].metadata?.userId?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Unauthorized access to dataset." });
    }

    const downloadStream = bucket.openDownloadStream(new ObjectId(id));
    
    downloadStream.on('error', (error) => {
      console.error("[GRIDFS DOWNLOAD ERROR]:", error);
      res.status(404).json({ error: "Dataset not found in storage." });
    });

    res.set('Content-Type', 'text/csv');
    res.set('Content-Disposition', `attachment; filename="${files[0].filename}"`);
    downloadStream.pipe(res);

  } catch (error) {
    console.error("[DOWNLOAD ERROR]:", error.message);
    res.status(500).json({ error: "Failed to download dataset." });
  }
};
