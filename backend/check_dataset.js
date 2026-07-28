const mongoose = require("mongoose");
const { GridFSBucket, ObjectId } = require("mongodb");
const dotenv = require("dotenv");
const dns = require("dns");

dns.setDefaultResultOrder("ipv4first");
dotenv.config();

async function checkDataset() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    const datasetId = "6a68b23b7e86c37fa00bc857";
    const bucket = new GridFSBucket(mongoose.connection.db, { bucketName: 'datasets' });
    
    const files = await bucket.find({ _id: new ObjectId(datasetId) }).toArray();
    if (!files || files.length === 0) {
      console.log("Dataset not found in DB!");
      process.exit(1);
    }

    console.log("\nGridFS File Metadata:", files[0]);

    // Download content into memory buffer
    const chunks = [];
    const downloadStream = bucket.openDownloadStream(new ObjectId(datasetId));
    
    downloadStream.on('data', (chunk) => chunks.push(chunk));
    downloadStream.on('end', () => {
      const buffer = Buffer.concat(chunks);
      console.log(`\nDownloaded size: ${buffer.length} bytes`);
      const csvText = buffer.toString('utf-8');
      console.log("\nFirst 300 characters of CSV file:\n");
      console.log(csvText.substring(0, 500));
      process.exit(0);
    });

  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
}

checkDataset();
