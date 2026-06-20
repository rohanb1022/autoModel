import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression, LinearRegression
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.tree import DecisionTreeClassifier, DecisionTreeRegressor
from sklearn.neural_network import MLPClassifier, MLPRegressor
from sklearn.svm import SVC, SVR
from sklearn.neighbors import KNeighborsClassifier, KNeighborsRegressor
from sklearn.cluster import KMeans, MiniBatchKMeans
from sklearn.mixture import GaussianMixture
from sklearn.metrics import accuracy_score, r2_score, silhouette_score
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
    
    # 3. Drop high-cardinality categorical columns to prevent feature explosion
    categorical_cols = X.select_dtypes(include=['object', 'category']).columns
    high_card_cols = [col for col in categorical_cols if X[col].nunique() > max_categories]
    
    cols_to_drop = list(set(constant_cols + high_card_cols))
    if cols_to_drop:
        print(f"Dropping high-cardinality columns: {cols_to_drop}")
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

    if problem_type == "classification":

        models = {
            "Logistic Regression": LogisticRegression(max_iter=1000, n_jobs=2),
            "Random Forest": RandomForestClassifier(n_estimators=50, max_depth=15, random_state=42, n_jobs=2),
            "Decision Tree": DecisionTreeClassifier(max_depth=15, random_state=42),
            "Support Vector Machine": SVC(probability=True, random_state=42),
            "K-Nearest Neighbors": KNeighborsClassifier(n_neighbors=5, n_jobs=2),
            "Artificial Neural Network": MLPClassifier(max_iter=500, random_state=42)
        }

        for name, model in models.items():
            model.fit(X_train, y_train)
            preds = model.predict(X_test)
            acc = accuracy_score(y_test, preds)

            results[name] = acc
            trained_models[name] = model

            print(f"{name} accuracy: {acc:.4f}")

        best_model_name = max(results, key=results.get)
        best_model = trained_models[best_model_name]

        print(f"\nBest model: {best_model_name}")

    elif problem_type == "regression":

        models = {
            "Linear Regression": LinearRegression(n_jobs=2),
            "Random Forest": RandomForestRegressor(n_estimators=50, max_depth=15, random_state=42, n_jobs=2),
            "Decision Tree": DecisionTreeRegressor(max_depth=15, random_state=42),
            "Support Vector Machine": SVR(),
            "K-Nearest Neighbors": KNeighborsRegressor(n_neighbors=5, n_jobs=2),
            "Artificial Neural Network": MLPRegressor(max_iter=500, random_state=42)
        }

        for name, model in models.items():
            model.fit(X_train, y_train)
            preds = model.predict(X_test)
            score = r2_score(y_test, preds)

            results[name] = score
            trained_models[name] = model

            print(f"{name} R2 score: {score:.4f}")

        best_model_name = max(results, key=results.get)
        best_model = trained_models[best_model_name]

        print(f"\nBest model: {best_model_name}")

    elif problem_type == "clustering":

        models = {
            "K-Means (k=3)": KMeans(n_clusters=3, random_state=42, n_init=10),
            "K-Means (k=5)": KMeans(n_clusters=5, random_state=42, n_init=10),
            "Mini Batch K-Means": MiniBatchKMeans(n_clusters=3, random_state=42, n_init=10),
            "Gaussian Mixture": GaussianMixture(n_components=3, random_state=42)
        }

        for name, model in models.items():
            model.fit(X_train)
            if hasattr(model, "predict"):
                preds = model.predict(X_test)
            else:
                preds = model.fit_predict(X_test)

            import numpy as np
            if len(np.unique(preds)) > 1:
                score = silhouette_score(X_test, preds)
            else:
                score = -1.0

            results[name] = score
            trained_models[name] = model

            print(f"{name} Silhouette score: {score:.4f}")

        best_model_name = max(results, key=results.get)
        best_model = trained_models[best_model_name]

        print(f"\nBest model: {best_model_name}")

    # save model
    joblib.dump(best_model, "outputs/best_model.pkl")
    print("Best model saved to outputs/best_model.pkl")

    best_score = results[best_model_name]
    
    # Extract top feature importances
    top_features = get_top_features(best_model, X_train.columns)

    return best_model_name, best_score, top_features


def get_top_features(model, feature_names, top_n=5):
    """
    Extracts top N feature importances or coefficients from a model.
    Returns a list of (feature_name, importance_score) tuples.
    """
    import numpy as np
    try:
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



