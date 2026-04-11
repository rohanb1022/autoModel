const axios = require('axios');
require("dotenv").config();

const key = process.env.GEMINI_API_KEY;

async function listModels() {
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;
    console.log("Querying:", url.replace(key, "HIDDEN_KEY"));
    
    const response = await axios.get(url);
    const models = response.data.models;
    
    console.log("Available Models:");
    models.forEach(m => {
        if (m.supportedGenerationMethods && m.supportedGenerationMethods.includes("generateContent")) {
            console.log(`- ${m.name}`);
        }
    });

  } catch (error) {
    console.error("Error listing models:");
    if (error.response) {
        console.error("Status:", error.response.status);
        console.error("Data:", JSON.stringify(error.response.data, null, 2));
    } else {
        console.error(error.message);
    }
  }
}

listModels();
