const axios = require("axios");
const fs = require("fs");
const FormData = require("form-data");
const { ML_SERVICE_URL } = require("../config/urls");

exports.uploadDataset = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const filePath = req.file.path;
    const token = req.headers.authorization;

    // prepare formdata
    const formData = new FormData();
    formData.append("file", fs.createReadStream(filePath), req.file.originalname);

    // send to ML service
    const response = await axios.post(
      `${ML_SERVICE_URL}/analyze`,
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          Authorization: token,
        },
      }
    );

    // optional: delete temp uploaded file
    fs.unlinkSync(filePath);

    // send ML analyze result back to frontend
    res.json(response.data);

  } catch (error) {
    console.error("[UPLOAD ERROR]:", error.message);
    res.status(500).json({
      error: "Dataset upload failed. Please ensure you uploaded a valid CSV file.",
    });
  }
};