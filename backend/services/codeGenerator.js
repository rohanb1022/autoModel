const axios = require("axios");
const { ML_SERVICE_URL } = require("../config/urls.js");

// -----------------------------------------------------------------------------
// 1. Open-Source LLM via Groq (Free Tier, Fast, Saves Gemini Tokens)
// -----------------------------------------------------------------------------
async function callGroqOpenSource(prompt) {
  const groqKey = process.env.GROQ_API_KEY;
  if (!groqKey) return null;

  const models = ["llama-3.3-70b-versatile", "llama-3.1-8b-instant"];

  for (const model of models) {
    try {
      const res = await axios.post(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          model: model,
          messages: [
            {
              role: "system",
              content:
                "You are an expert Python Machine Learning Engineer. Return ONLY pure, executable Python code enclosed in ```python ... ``` blocks. Do not include introductory or concluding conversational text."
            },
            { role: "user", content: prompt }
          ],
          temperature: 0.1,
          max_tokens: 2500
        },
        {
          headers: {
            Authorization: `Bearer ${groqKey}`,
            "Content-Type": "application/json"
          },
          timeout: 15000
        }
      );

      const raw = res.data?.choices?.[0]?.message?.content;
      const cleaned = cleanExtractedCode(raw);
      if (cleaned) {
        console.log(`[CodeGenerator] Generated via Groq open-source (${model})`);
        return cleaned;
      }
    } catch (err) {
      console.warn(`[CodeGenerator] Groq ${model} failed:`, err.message);
    }
  }
  return null;
}

// -----------------------------------------------------------------------------
// 2. Gemini REST API (Emergency Fallback)
// -----------------------------------------------------------------------------
async function callGeminiRest(prompt) {
  const keys = [
    process.env.GEMINI_API_KEY,
    process.env.GEMINI_API_KEY_2,
    process.env.GEMINI_API_KEY_3,
    process.env.GEMINI_API_KEY_4
  ].filter(Boolean);

  const models = ["gemini-1.5-flash", "gemini-2.0-flash"];

  for (const key of keys) {
    for (const model of models) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
        const res = await axios.post(
          url,
          {
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.1, maxOutputTokens: 2500 }
          },
          { timeout: 10000 }
        );

        const candidate = res.data?.candidates?.[0];
        const finishReason = candidate?.finishReason;
        const rawText = candidate?.content?.parts?.[0]?.text;

        if (rawText && (finishReason === "STOP" || !finishReason)) {
          const cleaned = cleanExtractedCode(rawText);
          if (cleaned) return cleaned;
        }
      } catch (err) {
        // Fallthrough to next key/model
      }
    }
  }
  return null;
}

// -----------------------------------------------------------------------------
// 3. Code Extractor & Validator
// -----------------------------------------------------------------------------
function cleanExtractedCode(text) {
  if (!text) return null;

  const match = text.match(/```(?:python)?\s*([\s\S]*?)```/i);
  if (!match || !match[1]) {
    // If no backticks, check if it's already raw Python code
    if (text.includes("import ") && (text.includes(".fit(") || text.includes("Pipeline("))) {
      return text.trim();
    }
    return null;
  }

  const codeStr = match[1].trim();
  const hasImports = codeStr.includes("import ") || codeStr.includes("from ");
  const hasLogic = codeStr.includes(".fit(") || codeStr.includes("Pipeline(") || codeStr.includes("model(");

  if (hasImports && hasLogic) {
    return codeStr;
  }
  return null;
}

// -----------------------------------------------------------------------------
// 4. Bulletproof Deterministic Template (Safe with missing values & types)
// -----------------------------------------------------------------------------
function generateDeterministicPythonCode(data) {
  const datasetName = data.datasetName || "dataset.csv";
  const bestModel = data.bestModel || "Logistic Regression";
  const problemType = data.problemType || "classification";
  const targetCol = data.targetColumn || "target";
  const scoreVal = data.accuracy || 0.90;
  const accStr = problemType === "clustering"
    ? scoreVal.toFixed(3)
    : `${(scoreVal * (scoreVal <= 1 ? 100 : 1)).toFixed(1)}%`;

  let modelImport = `from sklearn.linear_model import LogisticRegression\nmodel = LogisticRegression(max_iter=1000, random_state=42)`;
  let evalCode = `y_pred = pipeline.predict(X_test)\nprint("\\n" + "="*50)\nprint(f"Target Column: {TARGET_COL}")\nprint(f"Model Accuracy Score: {accuracy_score(y_test, y_pred) * 100:.2f}%")\nprint("="*50 + "\\n")\nprint("Detailed Classification Report:\\n", classification_report(y_test, y_pred))`;

  if (problemType === "regression") {
    modelImport = `from sklearn.ensemble import RandomForestRegressor\nmodel = RandomForestRegressor(n_estimators=100, random_state=42)`;
    evalCode = `y_pred = pipeline.predict(X_test)\nprint("\\n" + "="*50)\nprint(f"Target Column: {TARGET_COL}")\nprint(f"R2 Score: {r2_score(y_test, y_pred):.4f}")\nprint(f"RMSE: {np.sqrt(mean_squared_error(y_test, y_pred)):.4f}")\nprint("="*50)`;
  } else if (problemType === "clustering") {
    modelImport = `from sklearn.cluster import KMeans\nmodel = KMeans(n_clusters=3, random_state=42)`;
    evalCode = `labels = pipeline.fit_predict(X)\nX_processed = pipeline.named_steps['preprocessor'].transform(X)\nscore = silhouette_score(X_processed, labels)\nprint("\\n" + "="*50)\nprint(f"Silhouette Score: {score:.4f}")\nprint("="*50)`;
  } else {
    // Classification
    const bLower = bestModel.toLowerCase();
    if (bLower.includes("random forest")) {
      modelImport = `from sklearn.ensemble import RandomForestClassifier\nmodel = RandomForestClassifier(n_estimators=100, random_state=42)`;
    } else if (bLower.includes("xgboost")) {
      modelImport = `from xgboost import XGBClassifier\nmodel = XGBClassifier(n_estimators=100, learning_rate=0.05, random_state=42)`;
    } else if (bLower.includes("gradient")) {
      modelImport = `from sklearn.ensemble import GradientBoostingClassifier\nmodel = GradientBoostingClassifier(random_state=42)`;
    } else if (bLower.includes("svm") || bLower.includes("support vector")) {
      modelImport = `from sklearn.svm import SVC\nmodel = SVC(kernel='rbf', probability=True, random_state=42)`;
    } else if (bLower.includes("decision tree")) {
      modelImport = `from sklearn.tree import DecisionTreeClassifier\nmodel = DecisionTreeClassifier(random_state=42)`;
    } else if (bLower.includes("knn")) {
      modelImport = `from sklearn.neighbors import KNeighborsClassifier\nmodel = KNeighborsClassifier(n_neighbors=5)`;
    }
  }

  return `# ==============================================================================
# AutoModel Production Training & Inference Script
# Dataset: ${datasetName} | Model: ${bestModel} | Target: ${targetCol}
# Performance Score: ${accStr}
# ==============================================================================
# Google Colab / Local Setup:
# If running in Colab, upload your CSV file:
# from google.colab import files; files.upload()
# ==============================================================================

import os
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.impute import SimpleImputer
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.metrics import accuracy_score, classification_report, r2_score, mean_squared_error, silhouette_score

# 1. Load Dataset
DATASET_PATH = "${datasetName}" if os.path.exists("${datasetName}") else "dataset.csv"
print(f"Loading dataset: {DATASET_PATH}...")
df = pd.read_csv(DATASET_PATH)

# 2. Features & Target Isolation
TARGET_COL = "${targetCol}"

${problemType === "clustering" ? `X = df.copy()\ny = None` : `if TARGET_COL in df.columns:
    X = df.drop(columns=[TARGET_COL])
    y = df[TARGET_COL]
else:
    X = df.iloc[:, :-1]
    y = df.iloc[:, -1]`}

# Drop ID columns to prevent data leakage
id_cols = [c for c in X.columns if any(p in c.lower() for p in ['id', 'key', 'index', 'unnamed'])]
if id_cols:
    X = X.drop(columns=id_cols)

# 3. Automated Preprocessing Pipeline (Safe with NaNs & Types)
num_cols = X.select_dtypes(include=['int64', 'float64', 'int32', 'float32']).columns.tolist()
cat_cols = X.select_dtypes(include=['object', 'category', 'bool']).columns.tolist()

num_transformer = Pipeline(steps=[
    ('imputer', SimpleImputer(strategy='median')),
    ('scaler', StandardScaler())
])

cat_transformer = Pipeline(steps=[
    ('imputer', SimpleImputer(strategy='most_frequent')),
    ('onehot', OneHotEncoder(handle_unknown='ignore', sparse_output=False))
])

transformers = []
if num_cols:
    transformers.append(('num', num_transformer, num_cols))
if cat_cols:
    transformers.append(('cat', cat_transformer, cat_cols))

preprocessor = ColumnTransformer(transformers=transformers, remainder='drop')

# 4. Model Definition (${bestModel})
${modelImport}

pipeline = Pipeline(steps=[
    ('preprocessor', preprocessor),
    ('classifier', model)
])

# 5. Fit & Evaluate
${problemType === "clustering" ? evalCode : `X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
print("Fitting ${bestModel} model...")
pipeline.fit(X_train, y_train)

${evalCode}`}`;
}

// -----------------------------------------------------------------------------
// 5. Master Code Generator with In-App Verification & Open-Source Cascade
// -----------------------------------------------------------------------------
const generateModelCode = async (data, authToken = null) => {
  const datasetName = data.datasetName || "dataset.csv";
  const bestModel = data.bestModel || "Logistic Regression";
  const problemType = data.problemType || "classification";
  const targetCol = data.targetColumn || "target";
  const acc = data.accuracy
    ? (data.accuracy > 1 ? `${data.accuracy.toFixed(1)}%` : `${(data.accuracy * 100).toFixed(1)}%`)
    : "90%+";

  // Tier 1: In-App Execution & Verification in backend-ml Sandbox
  // Runs against real sample data, self-heals up to 2 times using Groq Llama 3.3 / Ollama
  try {
    console.log(`[CodeGenerator] Delegating to backend-ml sandbox verifier at ${ML_SERVICE_URL}...`);
    const mlResponse = await axios.post(
      `${ML_SERVICE_URL}/generate-verified-code`,
      {
        dataset_name: datasetName,
        target_column: targetCol,
        problem_type: problemType,
        best_model: bestModel,
        accuracy: data.accuracy || 0.9,
        dataset_id: data.datasetId
      },
      {
        headers: authToken ? { Authorization: authToken } : {},
        timeout: 25000
      }
    );

    if (mlResponse.data && mlResponse.data.code) {
      console.log(`[CodeGenerator] Sandbox verification successful! Provider: ${mlResponse.data.provider}`);
      return mlResponse.data.code;
    }
  } catch (mlErr) {
    console.warn(`[CodeGenerator] Backend-ml verification request skipped/failed: ${mlErr.message}`);
  }

  // Tier 2: Direct Groq Open-Source LLM (100% Free, 0 Gemini tokens)
  const prompt = `OUTPUT ONLY PURE EXECUTABLE PYTHON CODE INSIDE \`\`\`python ... \`\`\`. DO NOT INCLUDE INTRO OR OUTRO TEXT.

Generate complete, production-ready Python scikit-learn code for:
Dataset: ${datasetName}
Problem Type: ${problemType}
Best Model: ${bestModel}
Target Column: ${targetCol}
Accuracy: ${acc}

Requirements:
1. Handle both numerical and categorical columns safely with ColumnTransformer, SimpleImputer, and OneHotEncoder.
2. Load dataset from 'dataset.csv' (or ${datasetName}).
3. Train/test split (80/20) and print accuracy/score metrics.`;

  const groqCode = await callGroqOpenSource(prompt);
  if (groqCode) {
    return groqCode;
  }

  // Tier 3: Emergency Fallback — Gemini REST API
  const geminiCode = await callGeminiRest(prompt);
  if (geminiCode) {
    return geminiCode;
  }

  // Tier 4: Bulletproof Deterministic Template (0 tokens, guaranteed to work)
  return generateDeterministicPythonCode(data);
};

module.exports = generateModelCode;
