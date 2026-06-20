import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression, Ridge
from sklearn.compose import TransformedTargetRegressor
from sklearn.dummy import DummyRegressor
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.tree import DecisionTreeClassifier, DecisionTreeRegressor
from sklearn.neural_network import MLPClassifier, MLPRegressor
from sklearn.svm import SVC, SVR
from sklearn.neighbors import KNeighborsClassifier, KNeighborsRegressor
from sklearn.cluster import KMeans, MiniBatchKMeans
from sklearn.mixture import GaussianMixture
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    r2_score,
    mean_absolute_error,
    mean_squared_error,
    silhouette_score
)
import numpy as np
import joblib

def prepare_data(df, target_column, max_rows=10000, max_categories=50):

    print("\nPreparing data for training...\n")

    # 1. Subsample data if it's too large to reduce training latency
    if len(df) > max_rows:
        print(f"Subsampling data from {len(df)} to {max_rows} rows...")
        df = df.sample(n=max_rows, random_state=42)

    if target_column == "__clustering__":
        X = df.copy()
        y = None
    else:
        X = df.drop(columns=[target_column])
        y = df[target_column]

    # 2. Find constant columns
    constant_cols = [col for col in X.columns if X[col].nunique() <= 1]
    
    # 3. Find ID-like columns (both categorical and numeric) to prevent overfitting on serials/keys
    id_cols = []
    for col in X.columns:
        col_lower = col.lower()
        is_id_name = any(pattern in col_lower for pattern in ['id', 'key', 'index', 'pk', 'unnamed', 'serial'])
        is_unique_int = False
        if pd.api.types.is_integer_dtype(X[col]) and X[col].nunique() == len(X):
            is_unique_int = True
        if is_id_name or is_unique_int:
            id_cols.append(col)
            
    # 4. Drop high-cardinality categorical columns to prevent feature explosion
    categorical_cols = X.select_dtypes(include=['object', 'category']).columns
    high_card_cols = [col for col in categorical_cols if X[col].nunique() > max_categories]
    
    cols_to_drop = list(set(constant_cols + id_cols + high_card_cols))
    if cols_to_drop:
        print(f"Dropping constant/ID/high-cardinality columns: {cols_to_drop}")
        X = X.drop(columns=cols_to_drop)

    # convert categorical to numeric
    X = pd.get_dummies(X, drop_first=True)

    if target_column == "__clustering__":
        X_train, X_test = train_test_split(
            X, test_size=0.2, random_state=42
        )
        y_train, y_test = None, None
    else:
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )

    # Scale the features
    scaler = StandardScaler()
    
    # Store indices and column names to maintain DataFrame format after scaling
    train_cols = X_train.columns
    test_cols = X_test.columns
    
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    X_train = pd.DataFrame(X_train_scaled, columns=train_cols, index=X_train.index)
    X_test = pd.DataFrame(X_test_scaled, columns=test_cols, index=X_test.index)

    # Save scaler for prediction time
    joblib.dump(scaler, "outputs/scaler.pkl")

    print("Training samples:", X_train.shape[0])
    print("Testing samples:", X_test.shape[0])

    return X_train, X_test, y_train, y_test, cols_to_drop


def train_models(X_train, X_test, y_train, y_test, problem_type):

    print("\nTraining models...\n")

    results = {}
    trained_models = {}
    all_metrics = {}
    optuna_results = {
        "run": False,
        "best_params": {},
        "best_score": 0.0,
        "n_trials": 0
    }

    from src.automl.models import get_models
    from src.automl.optimizer import AutoMLOptimizer

    if problem_type in ["classification", "regression"]:
        models = get_models(problem_type)

        for name, model in models.items():
            try:
                model.fit(X_train, y_train)
                preds = model.predict(X_test)
                if problem_type == "classification":
                    acc = accuracy_score(y_test, preds)
                    prec = precision_score(y_test, preds, average="weighted", zero_division=0)
                    rec = recall_score(y_test, preds, average="weighted", zero_division=0)
                    f1 = f1_score(y_test, preds, average="weighted", zero_division=0)
                    
                    results[name] = acc
                    all_metrics[name] = {
                        "accuracy": float(acc),
                        "precision": float(prec),
                        "recall": float(rec),
                        "f1": float(f1)
                    }
                    print(f"{name} base score (accuracy): {acc:.4f}")
                else:
                    r2 = r2_score(y_test, preds)
                    mae = mean_absolute_error(y_test, preds)
                    mse = mean_squared_error(y_test, preds)
                    rmse = float(np.sqrt(mse))
                    
                    results[name] = r2
                    all_metrics[name] = {
                        "r2": float(r2),
                        "mae": float(mae),
                        "rmse": rmse
                    }
                    print(f"{name} base score (R2): {r2:.4f}")
                    
                trained_models[name] = model
            except Exception as e:
                print(f"{name} failed to train: {e}")

        if not results:
            raise ValueError("No models succeeded in training.")

        best_model_name = max(results, key=results.get)
        best_model = trained_models[best_model_name]
        best_score = results[best_model_name]

        print(f"\nBest base model: {best_model_name}")
        
        # Hyperparameter optimization using Optuna (n_trials=10)
        print(f"Starting Optuna hyperparameter optimization for {best_model_name}...")
        optimizer = AutoMLOptimizer(X_train, y_train, problem_type)
        opt_score, opt_model = optimizer.optimize_model(best_model_name, n_trials=10)
        
        if opt_model is not None and opt_score > best_score:
            print(f"Optuna CV score ({opt_score:.4f}) > base test score ({best_score:.4f}). Adopting optimized model.")
            opt_model.fit(X_train, y_train)
            preds = opt_model.predict(X_test)
            if problem_type == "classification":
                final_score = accuracy_score(y_test, preds)
                prec = precision_score(y_test, preds, average="weighted", zero_division=0)
                rec = recall_score(y_test, preds, average="weighted", zero_division=0)
                f1 = f1_score(y_test, preds, average="weighted", zero_division=0)
                
                results[best_model_name] = final_score
                all_metrics[best_model_name] = {
                    "accuracy": float(final_score),
                    "precision": float(prec),
                    "recall": float(rec),
                    "f1": float(f1)
                }
            else:
                final_score = r2_score(y_test, preds)
                mae = mean_absolute_error(y_test, preds)
                mse = mean_squared_error(y_test, preds)
                rmse = float(np.sqrt(mse))
                
                results[best_model_name] = final_score
                all_metrics[best_model_name] = {
                    "r2": float(final_score),
                    "mae": float(mae),
                    "rmse": rmse
                }
                
            best_model = opt_model
            print(f"Final Optimized Test Score: {final_score:.4f}")
        else:
            print(f"Optuna did not improve the model. Keeping base model.")

        optuna_results = {
            "run": True,
            "best_params": optimizer.best_params,
            "best_score": float(opt_score) if opt_score is not None else 0.0,
            "n_trials": 10
        }

    elif problem_type == "clustering":

        models = {
            "K-Means (k=3)": KMeans(n_clusters=3, random_state=42, n_init=10),
            "K-Means (k=5)": KMeans(n_clusters=5, random_state=42, n_init=10),
            "Mini Batch K-Means": MiniBatchKMeans(n_clusters=3, random_state=42, n_init=10),
            "Gaussian Mixture": GaussianMixture(n_components=3, random_state=42)
        }

        for name, model in models.items():
            try:
                model.fit(X_train)
                if hasattr(model, "predict"):
                    preds = model.predict(X_test)
                else:
                    preds = model.fit_predict(X_test)

                if len(np.unique(preds)) > 1:
                    score = silhouette_score(X_test, preds)
                else:
                    score = -1.0

                results[name] = score
                trained_models[name] = model
                all_metrics[name] = {
                    "silhouette": float(score)
                }

                print(f"{name} Silhouette score: {score:.4f}")
            except Exception as e:
                print(f"{name} failed in clustering: {e}")

        if not results:
            raise ValueError("No clustering models succeeded.")

        best_model_name = max(results, key=results.get)
        best_model = trained_models[best_model_name]

        print(f"\nBest model: {best_model_name}")

    # save model
    joblib.dump(best_model, "outputs/best_model.pkl")
    print("Best model saved to outputs/best_model.pkl")

    best_score = results[best_model_name]
    if problem_type == "regression" and best_score < 0.0:
        best_score = 0.0
    
    # Extract top feature importances
    top_features = get_top_features(best_model, X_train.columns)

    # Construct sorted leaderboard
    leaderboard = []
    for name in sorted(results, key=results.get, reverse=True):
        leaderboard.append({
            "model": name,
            "score": float(results[name]),
            "metrics": all_metrics.get(name, {})
        })

    return best_model_name, best_score, top_features, leaderboard, optuna_results



def get_top_features(model, feature_names, top_n=5):
    """
    Extracts top N feature importances or coefficients from a model.
    Returns a list of (feature_name, importance_score) tuples.
    """
    import numpy as np
    try:
        if hasattr(model, "regressor_"):
            model = model.regressor_
        if hasattr(model, "feature_importances_"):
            importances = model.feature_importances_
        elif hasattr(model, "coef_"):
            coef = model.coef_
            # For multi-class classification, coefficients can be 2D.
            # Take the mean absolute value across classes.
            if len(coef.shape) > 1:
                importances = np.mean(np.abs(coef), axis=0)
            else:
                importances = np.abs(coef)
        elif hasattr(model, "cluster_centers_"):
            # For K-Means, use variance of features across cluster centers
            importances = np.var(model.cluster_centers_, axis=0)
        elif hasattr(model, "means_"):
            # For Gaussian Mixture, use variance of features across cluster means
            importances = np.var(model.means_, axis=0)
        else:
            return []

        # Get indices of top features
        indices = np.argsort(importances)[::-1]
        top_features = []
        for i in indices[:top_n]:
            if i < len(feature_names):
                top_features.append((feature_names[i], float(importances[i])))
        return top_features
    except Exception as e:
        print(f"Error extracting feature importances: {e}")
        return []



