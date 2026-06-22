const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const generateModelCode = async (data) => {
  try {

    const model = genAI.getGenerativeModel({
      model: "gemini-3.5-flash"
    });

    const isANN = data.bestModel && (data.bestModel.includes("ANN") || data.bestModel.includes("Neural Network"));
    const libraryName = isANN ? "PyTorch" : "scikit-learn";

    const prompt = `
You are a senior machine learning engineer.

Generate complete Python code using ${libraryName} for this model.

Dataset name: ${data.datasetName}
Problem type: ${data.problemType}
Best model: ${data.bestModel}
${data.problemType === 'clustering' ? 'Silhouette Score' : 'Accuracy'}: ${data.accuracy}

Generate:
- import libraries (including ${isANN ? 'torch and torch.nn' : 'sklearn'})
- load dataset
- preprocessing (StandardScaler for numeric features, One-Hot Encoding for categorical)
- train test split
- model training (with 10-epoch patience early stopping if PyTorch ANN)
- metric/score printing
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
