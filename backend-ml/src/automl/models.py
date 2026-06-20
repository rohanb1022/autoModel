from sklearn.linear_model import LogisticRegression, LinearRegression
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor, GradientBoostingClassifier, GradientBoostingRegressor
from xgboost import XGBClassifier, XGBRegressor
from lightgbm import LGBMClassifier, LGBMRegressor

def get_models(problem_type: str):
    if problem_type == "classification":
        return {
            "Logistic Regression": LogisticRegression(max_iter=1000, n_jobs=2),
            "Random Forest": RandomForestClassifier(random_state=42, n_jobs=2),
            "Gradient Boosting": GradientBoostingClassifier(random_state=42),
            "XGBoost": XGBClassifier(use_label_encoder=False, eval_metric="logloss", random_state=42, n_jobs=2),
            "LightGBM": LGBMClassifier(random_state=42, n_jobs=2, verbose=-1)
        }
    elif problem_type == "regression":
        return {
            "Linear Regression": LinearRegression(n_jobs=2),
            "Random Forest": RandomForestRegressor(random_state=42, n_jobs=2),
            "Gradient Boosting": GradientBoostingRegressor(random_state=42),
            "XGBoost": XGBRegressor(random_state=42, n_jobs=2),
            "LightGBM": LGBMRegressor(random_state=42, n_jobs=2, verbose=-1)
        }
    return {}

