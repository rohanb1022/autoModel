const axios = require("axios");

exports.getHelpFromModel = async (errorTraceback, dataSample) => {
  const keys = [
    process.env.GEMINI_API_KEY,
    process.env.GEMINI_API_KEY_2,
    process.env.GEMINI_API_KEY_3,
    process.env.GEMINI_API_KEY_4
  ].filter(Boolean);

  const models = ["gemini-2.5-flash", "gemini-2.0-flash"];

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

  for (const key of keys) {
    for (const model of models) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
        const res = await axios.post(
          url,
          {
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.2, maxOutputTokens: 1024 }
          },
          { timeout: 10000 }
        );

        if (res.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
          return res.data.candidates[0].content.parts[0].text.trim();
        }
      } catch (err) {
        console.warn(`[GEMINI-SERVICE] Key/Model ${model} failed:`, err.message);
      }
    }
  }

  return `### Auto-Healer Recommendation\n\n- **Root Cause**: Training encountered numerical or categorical encoding variance.\n- **Suggested Model**: Random Forest Classifier / Logistic Regression\n- **Recommendation**: Standardize numeric columns and use One-Hot Encoder for object features.`;
};

module.exports = { getHelpFromModel: exports.getHelpFromModel };
