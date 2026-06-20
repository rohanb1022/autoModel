import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

import pandas as pd
import numpy as np
from src.train import prepare_data, train_models

def run_tests():
    # 1. Create a dummy dataset
    np.random.seed(42)
    n_samples = 100
    
    data = {
        "feature_1": np.random.randn(n_samples),
        "feature_2": np.random.rand(n_samples) * 10,
        "categorical_1": np.random.choice(["A", "B", "C"], size=n_samples),
        "constant_1": [1.0] * n_samples,
        "class_target": np.random.choice([0, 1], size=n_samples),
        "reg_target": np.random.randn(n_samples) * 5 + 3
    }
    
    df = pd.DataFrame(data)
    
    print("\n--- TESTING CLASSIFICATION ---")
    X_train, X_test, y_train, y_test, dropped_cols = prepare_data(df.drop(columns=["reg_target"]), "class_target")
    best_model, score, features = train_models(X_train, X_test, y_train, y_test, "classification")
    print(f"Classification Best Model: {best_model}, Score: {score}")
    print(f"Top Features: {features}")
    
    print("\n--- TESTING REGRESSION ---")
    X_train, X_test, y_train, y_test, dropped_cols = prepare_data(df.drop(columns=["class_target"]), "reg_target")
    best_model, score, features = train_models(X_train, X_test, y_train, y_test, "regression")
    print(f"Regression Best Model: {best_model}, Score: {score}")
    print(f"Top Features: {features}")
    
    print("\n--- TESTING CLUSTERING ---")
    X_train, X_test, y_train, y_test, dropped_cols = prepare_data(df.drop(columns=["class_target", "reg_target"]), "__clustering__")
    best_model, score, features = train_models(X_train, X_test, y_train, y_test, "clustering")
    print(f"Clustering Best Model: {best_model}, Score: {score}")
    print(f"Top Features: {features}")

if __name__ == "__main__":
    run_tests()
