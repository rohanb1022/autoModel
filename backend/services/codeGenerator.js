const axios = require("axios");

async function callGeminiRest(prompt) {
  const keys = [
    process.env.GEMINI_API_KEY,
    process.env.GEMINI_API_KEY_2,
    process.env.GEMINI_API_KEY_3,
    process.env.GEMINI_API_KEY_4
  ].filter(Boolean);

  const models = ["gemini-2.5-flash", "gemini-2.0-flash"];

  for (const key of keys) {
    for (const model of models) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
        const res = await axios.post(
          url,
          {
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.1, maxOutputTokens: 4096 }
          },
          { timeout: 12000 }
        );

        const rawText = res.data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (rawText) {
          const cleaned = cleanExtractedCode(rawText);
          if (cleaned) return cleaned;
        }
      } catch (err) {
        console.warn(`[CODE-GEN] Gemini key/model ${model} failed:`, err.message);
      }
    }
  }
  return null;
}

function cleanExtractedCode(text) {
  if (!text) return null;

  // Extract content between ```python ... ``` or ``` ... ```
  const match = text.match(/```(?:python)?\s*([\s\S]*?)```/i);
  let codeStr = match ? match[1].trim() : text.trim();

  // Basic sanity check: verify code is not truncated mid-line and contains imports + model execution
  if (
    (codeStr.includes("import ") || codeStr.includes("from ")) &&
    (codeStr.includes("fit") || codeStr.includes("predict") || codeStr.includes("torch") || codeStr.includes("model")) &&
    !codeStr.endsWith("utf-") &&
    !codeStr.endsWith("#")
  ) {
    return `\`\`\`python\n${codeStr}\n\`\`\``;
  }
  return null;
}

function generateDeterministicPythonCode(data) {
  const datasetName = data.datasetName || "Heart_disease_statlog.csv";
  const bestModel = data.bestModel || "Logistic Regression";
  const problemType = data.problemType || "classification";
  const targetCol = data.targetColumn || "target";
  const scoreVal = data.accuracy || 0.926;
  const accStr = problemType === 'clustering' ? scoreVal.toFixed(3) : `${(scoreVal * (scoreVal <= 1 ? 100 : 1)).toFixed(1)}%`;

  const isANN = bestModel.includes("ANN") || bestModel.includes("Neural Network") || bestModel.includes("PyTorch");

  let codeBody = "";

  if (isANN) {
    codeBody = `# ==============================================================================
# AutoModel Production Inference & Training Script (PyTorch Neural Network)
# Dataset: ${datasetName} | Model: ${bestModel} | Target: ${targetCol}
# Performance Score: ${accStr}
# ==============================================================================

import pandas as pd
import numpy as np
import torch
import torch.nn as nn
import torch.optim as optim
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import classification_report, accuracy_score

print("Loading dataset '${datasetName}'...")
df = pd.read_csv("${datasetName}")

# 1. Feature & Target Isolation
if "${targetCol}" in df.columns:
    X = df.drop(columns=["${targetCol}"]).select_dtypes(include=[np.number]).values
    y = df["${targetCol}"].values
else:
    X = df.iloc[:, :-1].select_dtypes(include=[np.number]).values
    y = df.iloc[:, -1].values

# 2. Train / Test Split (80/20)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# 3. Feature Scaling
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

# Convert to PyTorch Tensors
X_train_t = torch.tensor(X_train_scaled, dtype=torch.float32)
y_train_t = torch.tensor(y_train, dtype=torch.long)
X_test_t = torch.tensor(X_test_scaled, dtype=torch.float32)
y_test_t = torch.tensor(y_test, dtype=torch.long)

# 4. Neural Network Architecture
class PyTorchANNModel(nn.Module):
    def __init__(self, input_dim, num_classes=2):
        super(PyTorchANNModel, self).__init__()
        self.fc1 = nn.Linear(input_dim, 64)
        self.relu = nn.ReLU()
        self.dropout = nn.Dropout(0.2)
        self.fc2 = nn.Linear(64, 32)
        self.out = nn.Linear(32, num_classes)
        
    def forward(self, x):
        x = self.relu(self.fc1(x))
        x = self.dropout(x)
        x = self.relu(self.fc2(x))
        return self.out(x)

num_classes = len(np.unique(y))
model = PyTorchANNModel(input_dim=X_train.shape[1], num_classes=num_classes)
criterion = nn.CrossEntropyLoss()
optimizer = optim.Adam(model.parameters(), lr=0.001)

# 5. Training Loop
print("Training PyTorch ANN Neural Network...")
for epoch in range(100):
    optimizer.zero_grad()
    outputs = model(X_train_t)
    loss = criterion(outputs, y_train_t)
    loss.backward()
    optimizer.step()

# 6. Model Evaluation
model.eval()
with torch.no_grad():
    predictions = torch.argmax(model(X_test_t), dim=1).numpy()
    final_acc = accuracy_score(y_test, predictions)
    print(f"\\n>>> Model Accuracy: {final_acc * 100:.2f}% <<<\\n")
    print("Classification Report:\\n", classification_report(y_test, predictions))`;
  } else {
    let modelImport = `from sklearn.linear_model import LogisticRegression\nmodel = LogisticRegression(max_iter=1000, random_state=42)`;
    
    if (bestModel.includes("Random Forest")) {
      modelImport = `from sklearn.ensemble import RandomForestClassifier\nmodel = RandomForestClassifier(n_estimators=100, max_depth=10, random_state=42)`;
    } else if (bestModel.includes("XGBoost")) {
      modelImport = `from xgboost import XGBClassifier\nmodel = XGBClassifier(n_estimators=100, learning_rate=0.05, random_state=42)`;
    } else if (bestModel.includes("Gradient")) {
      modelImport = `from sklearn.ensemble import GradientBoostingClassifier\nmodel = GradientBoostingClassifier(n_estimators=100, learning_rate=0.1, random_state=42)`;
    } else if (bestModel.includes("SVM") || bestModel.includes("Support Vector")) {
      modelImport = `from sklearn.svm import SVC\nmodel = SVC(kernel='rbf', probability=True, random_state=42)`;
    } else if (bestModel.includes("Decision Tree")) {
      modelImport = `from sklearn.tree import DecisionTreeClassifier\nmodel = DecisionTreeClassifier(random_state=42)`;
    } else if (bestModel.includes("KNN") || bestModel.includes("K-Neighbors")) {
      modelImport = `from sklearn.neighbors import KNeighborsClassifier\nmodel = KNeighborsClassifier(n_neighbors=5)`;
    }

    codeBody = `# ==============================================================================
# AutoModel Production Inference & Training Script
# Dataset: ${datasetName} | Model: ${bestModel} | Target: ${targetCol}
# Performance Score: ${accStr}
# ==============================================================================

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.metrics import classification_report, accuracy_score

# 1. Load Dataset
print("Loading dataset '${datasetName}'...")
df = pd.read_csv("${datasetName}")

# 2. Features & Target Isolation
if "${targetCol}" in df.columns:
    X = df.drop(columns=["${targetCol}"])
    y = df["${targetCol}"]
else:
    X = df.iloc[:, :-1]
    y = df.iloc[:, -1]

# 3. Automated Preprocessing Pipeline
num_cols = X.select_dtypes(include=['int64', 'float64']).columns.tolist()
cat_cols = X.select_dtypes(include=['object', 'category']).columns.tolist()

preprocessor = ColumnTransformer(
    transformers=[
        ('num', StandardScaler(), num_cols),
        ('cat', OneHotEncoder(handle_unknown='ignore', sparse_output=False), cat_cols)
    ]
)

# 4. Model Definition (${bestModel})
${modelImport}

pipeline = Pipeline(steps=[
    ('preprocessor', preprocessor),
    ('classifier', model)
])

# 5. Train / Test Split (80% Train, 20% Test)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# 6. Fit Model & Evaluate
print("Fitting ${bestModel} model...")
pipeline.fit(X_train, y_train)

y_pred = pipeline.predict(X_test)

print("\\n" + "="*50)
print(f"Target Column: ${targetCol}")
print(f"Model Accuracy Score: {accuracy_score(y_test, y_pred) * 100:.2f}%")
print("="*50 + "\\n")
print("Detailed Classification Report:\\n", classification_report(y_test, y_pred))`;
  }

  return `\`\`\`python\n${codeBody}\n\`\`\``;
}

const generateModelCode = async (data) => {
  const datasetName = data.datasetName || "Heart_disease_statlog.csv";
  const bestModel = data.bestModel || "Logistic Regression";
  const problemType = data.problemType || "classification";
  const targetCol = data.targetColumn || "target";
  const acc = data.accuracy ? (data.accuracy > 1 ? `${data.accuracy.toFixed(1)}%` : `${(data.accuracy * 100).toFixed(1)}%`) : "90%+";

  const isANN = bestModel.includes("ANN") || bestModel.includes("Neural Network") || bestModel.includes("PyTorch");
  const libraryName = isANN ? "PyTorch" : "scikit-learn";

  const prompt = `OUTPUT ONLY PURE EXECUTABLE PYTHON CODE. DO NOT INCLUDE ANY INTRODUCTORY OR CONVERSATIONAL TEXT. DO NOT WRITE "Here is your script:".

Generate complete, self-contained Python code using ${libraryName} for:
Dataset name: ${datasetName}
Problem type: ${problemType}
Best model: ${bestModel}
Target column: ${targetCol}
Accuracy: ${acc}

Requirements:
- import libraries
- load dataset pd.read_csv("${datasetName}")
- ColumnTransformer preprocessing
- train_test_split (80/20)
- model fitting
- accuracy printing and classification_report

Enclose code in \`\`\`python ... \`\`\`.`;

  // 1. Primary: Try Gemini REST API with clean extraction
  const aiCode = await callGeminiRest(prompt);
  if (aiCode) {
    return aiCode;
  }

  // 2. Guaranteed Fallback: High-Quality Production Python Inference Code
  return generateDeterministicPythonCode(data);
};

module.exports = generateModelCode;
