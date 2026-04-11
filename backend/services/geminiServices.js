const { GoogleGenerativeAI } = require("@google/generative-ai");

let genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.getHelpFromModel = async (errorTraceback, dataSample) => {
  try {
    let model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash"
    });

    const prompt = `
You are a senior Machine Learning Architect and Data Engineer.
The following ML training pipeline just crashed. I need you to suggest a better model or fix the training logic.

**Error Traceback:**
${errorTraceback}

**Dataset Sample (First 10 rows):**
${JSON.stringify(dataSample, null, 2)}

Provide your response in the following format:
1. **Root Cause**: Explain exactly why this dataset failed in 1-2 sentences.
2. **Suggested Model**: Recommend the best Scikit-Learn or XGBoost model for this data.
3. **Execution Code**: Provide a clean, ready-to-use Python code block that solves the issue and trains the model.

Keep the advice practical and technical.
`;

    let result;
    try {
      result = await model.generateContent(prompt);
    } catch (apiErr) {
      console.log(`Gemini API key 1 failed: ${apiErr.message}. Falling back to key 2...`);
      if (process.env.GEMINI_API_KEY_2) {
        const fallbackGenAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY_2);
        model = fallbackGenAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        result = await model.generateContent(prompt);
      } else {
        throw apiErr;
      }
    }

    const response = await result.response.text();
    return response;
  } catch (err) {
    console.error("Gemini Help Error:", err.message);
    return "AI was unable to generate advice at this moment. Please check your dataset formatting.";
  }
};

module.exports = { getHelpFromModel: exports.getHelpFromModel };

