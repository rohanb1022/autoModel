const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function listModels() {
  const models = ["gemini-pro", "gemini-1.5-flash", "gemini-1.5-flash-latest", "gemini-1.0-pro"];

  for (const modelName of models) {
      try {
        console.log(`Checking ${modelName}...`);
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent("Test");
        console.log(`SUCCESS: ${modelName} works!`);
        return; // found one!
      } catch (error) {
         console.log(`FAILED: ${modelName} - ${error.message}`);
      }
  }
}

listModels();
