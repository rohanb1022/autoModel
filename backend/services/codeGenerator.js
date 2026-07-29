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
            generationConfig: { temperature: 0.2, maxOutputTokens: 1500 }
          },
          { timeout: 10000 }
        );

        if (res.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
          return res.data.candidates[0].content.parts[0].text.trim();
        }
      } catch (err) {
        console.warn(`[CODE-GEN] Gemini key/model ${model} failed:`, err.message);
      }
    }
  }
  return null;
}

const generateModelCode = async (data) => {
  const datasetName = data.datasetName || "uploaded_dataset.csv";
  const bestModel = data.bestModel || "Random Forest Classifier";
  const problemType = data.problemType || "classification";
  const targetCol = data.targetColumn || "target";
  const acc = data.accuracy ? (data.accuracy > 1 ? `${data.accuracy.toFixed(1)}%` : `${(data.accuracy * 100).toFixed(1)}%`) : "90%+";

  const isANN = bestModel.includes("ANN") || bestModel.includes("Neural Network") || bestModel.includes("PyTorch");
  const libraryName = isANN ? "PyTorch" : "scikit-learn";

  const prompt = `You are a senior machine learning engineer.

Generate clean, self-contained Python code using ${libraryName} to train and evaluate this model:

Dataset name: ${datasetName}
Problem type: ${problemType}
Best model: ${bestModel}
Accuracy: ${acc}

Generate:
- import libraries (including ${isANN ? 'torch and torch.nn' : 'sklearn'})
- load dataset
- preprocessing (StandardScaler for numeric features, One-Hot Encoding for categorical)
- train test split (80/20)
- model definition and fitting
- evaluation score & classification report printing

Give clean, ready-to-run Google Colab code inside markdown code blocks.`;

  // 1. Primary: Try Gemini REST API
  const aiCode = await callGeminiRest(prompt);
  if (aiCode) {
    return aiCode;
  }

  // 2. Guaranteed Fallback: High-Quality Production Python Inference Code
  if (isANN) {
    return `import pandas as pd
import numpy as np
import torch
import torch.nn as nn
import torch.optim as optim
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler

# 1. Load Dataset
df = pd.read_csv("${datasetName}")

# 2. Features & Target Selection
X = df.drop(columns=["${targetCol}"]).select_dtypes(include=[np.number]).values
y = df["${targetCol}"].values

# 3. Train/Test Split & Normalization
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
scaler = StandardScaler()
X_train = scaler.fit_transform(X_train)
X_test = scaler.transform(X_test)

# Convert to PyTorch Tensors
X_train_t = torch.tensor(X_train, dtype=torch.float32)
y_train_t = torch.tensor(y_train, dtype=torch.long if "${problemType}" == "classification" else torch.float32)
X_test_t = torch.tensor(X_test, dtype=torch.float32)
y_test_t = torch.tensor(y_test, dtype=torch.long if "${problemType}" == "classification" else torch.float32)

# 4. Neural Network Architecture
class AutoModelANN(nn.Module):
    def __init__(self, input_dim, num_classes=2):
        super(AutoModelANN, self).__init__()
        self.fc1 = nn.Linear(input_dim, 64)
        self.relu = nn.ReLU()
        self.fc2 = nn.Linear(64, 32)
        self.out = nn.Linear(32, num_classes)
        
    def forward(self, x):
        x = self.relu(self.fc1(x))
        x = self.relu(self.fc2(x))
        return self.out(x)

model = AutoModelANN(input_dim=X_train.shape[1])
criterion = nn.CrossEntropyLoss()
optimizer = optim.Adam(model.parameters(), lr=0.001)

# 5. Training Loop
for epoch in range(50):
    optimizer.zero_grad()
    outputs = model(X_train_t)
    loss = criterion(outputs, y_train_t)
    loss.backward()
    optimizer.step()

# 6. Model Evaluation
model.eval()
with torch.no_grad():
    preds = torch.argmax(model(X_test_t), dim=1)
    acc = (preds == y_test_t).float().mean()
    print(f"PyTorch ANN Model Accuracy: {acc.item() * 100:.2f}%")
`;
  }

  // Scikit-Learn / XGBoost Fallback Code
  let modelImport = "from sklearn.ensemble import RandomForestClassifier\nmodel = RandomForestClassifier(n_estimators=100, random_state=42)";
  if (bestModel.includes("Logistic")) {
    modelImport = "from sklearn.linear_model import LogisticRegression\nmodel = LogisticRegression(max_iter=1000)";
  } else if (bestModel.includes("XGBoost")) {
    modelImport = "from xgboost import XGBClassifier\nmodel = XGBClassifier(use_label_encoder=False, eval_metric='logloss')";
  } else if (bestModel.includes("Gradient")) {
    modelImport = "from sklearn.ensemble import GradientBoostingClassifier\nmodel = GradientBoostingClassifier(random_state=42)";
  } else if (bestModel.includes("SVM") || bestModel.includes("Support Vector")) {
    modelImport = "from sklearn.svm import SVC\nmodel = SVC(kernel='rbf', probability=True)";
  }

  return `import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.metrics import classification_report, accuracy_score

# 1. Load Dataset
df = pd.read_csv("${datasetName}")

# 2. Features & Target
X = df.drop(columns=["${targetCol}"])
y = df["${targetCol}"]

# 3. Preprocessing Pipeline
num_cols = X.select_dtypes(include=['int64', 'float64']).columns
cat_cols = X.select_dtypes(include=['object', 'category']).columns

preprocessor = ColumnTransformer(
    transformers=[
        ('num', StandardScaler(), num_cols),
        ('cat', OneHotEncoder(handle_unknown='ignore'), cat_cols)
    ]
)

# 4. Model Definition (${bestModel})
${modelImport}

pipeline = Pipeline(steps=[
    ('preprocessor', preprocessor),
    ('model', model)
])

# 5. Train/Test Split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# 6. Fit Model & Print Metrics
pipeline.fit(X_train, y_train)
y_pred = pipeline.predict(X_test)

print("Target Column:", "${targetCol}")
print("Model Accuracy:", accuracy_score(y_test, y_pred))
print("\nDetailed Evaluation Report:\n", classification_report(y_test, y_pred))
`;
};

module.exports = generateModelCode;
