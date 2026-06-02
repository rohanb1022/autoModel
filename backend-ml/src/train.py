import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression, LinearRegression
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.tree import DecisionTreeClassifier, DecisionTreeRegressor
from sklearn.metrics import accuracy_score, r2_score
import joblib

def prepare_data(df, target_column, max_rows=10000, max_categories=50):

    print("\nPreparing data for training...\n")

    # 1. Subsample data if it's too large to reduce training latency
    if len(df) > max_rows:
        print(f"Subsampling data from {len(df)} to {max_rows} rows...")
        df = df.sample(n=max_rows, random_state=42)

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
            "Decision Tree": DecisionTreeClassifier(max_depth=15, random_state=42)
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

    else:

        models = {
            "Linear Regression": LinearRegression(n_jobs=2),
            "Random Forest": RandomForestRegressor(n_estimators=50, max_depth=15, random_state=42, n_jobs=2),
            "Decision Tree": DecisionTreeRegressor(max_depth=15, random_state=42)
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

    # save model
    joblib.dump(best_model, "outputs/best_model.pkl")
    print("Best model saved to outputs/best_model.pkl")

    best_score = results[best_model_name]

    return best_model_name, best_score

