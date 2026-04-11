const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const generateModelCode = async (data) => {
  try {

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash"
    });

    const prompt = `
You are a senior machine learning engineer.

Generate complete Python sklearn code for this model.

Dataset name: ${data.datasetName}
Problem type: ${data.problemType}
Best model: ${data.bestModel}
Accuracy: ${data.accuracy}

Generate:
- import libraries
- load dataset
- preprocessing
- train test split
- model training
- accuracy print
- plots

Give clean ready-to-run Google Colab code.
Only output code.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response.text();

    return response;

  } catch (err) {
    console.log("Code generation error:", err.message);
    return "Code generation failed";
  }
};

module.exports = generateModelCode;
