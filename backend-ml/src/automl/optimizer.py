import optuna
import numpy as np
from sklearn.model_selection import cross_val_score

class AutoMLOptimizer:
    def __init__(self, X_train, y_train, problem_type):
        self.X_train = X_train
        self.y_train = y_train
        self.problem_type = problem_type
        self.best_params = {}
        self.best_score = None
        
    def optimize_model(self, model_name, n_trials=10, timeout=600):
        optuna.logging.set_verbosity(optuna.logging.WARNING)
        
        def objective(trial):
            model = self._instantiate_model(model_name, trial)
            if model is None:
                return -float('inf')
                
            scoring = "accuracy" if self.problem_type == "classification" else "r2"
            
            try:
                # 3-fold cross validation for speed
                scores = cross_val_score(model, self.X_train, self.y_train, cv=3, scoring=scoring, n_jobs=2)
                mean_score = np.mean(scores)
                return -100.0 if np.isnan(mean_score) else mean_score
            except Exception:
                return -float('inf')
                
        study = optuna.create_study(direction="maximize")
        study.optimize(objective, n_trials=n_trials, timeout=timeout, n_jobs=1)
        
        if len(study.trials) == 0 or study.best_value == -float('inf') or study.best_value == -100.0:
            return None, None
            
        self.best_params = study.best_trial.params
        self.best_score = study.best_value
        
        best_model = self._instantiate_model(model_name, study.best_trial)
        return self.best_score, best_model
        
    def _instantiate_model(self, model_name, trial):
        # Unwrap trial.params if passed as a Trial or a FrozenTrial
        params_source = trial.params if hasattr(trial, "params") else {}
        
        if model_name == "Random Forest":
            from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
            max_depth = trial.suggest_int("max_depth", 3, 20) if hasattr(trial, "suggest_int") else params_source.get("max_depth", 10)
            n_estimators = trial.suggest_int("n_estimators", 50, 200) if hasattr(trial, "suggest_int") else params_source.get("n_estimators", 100)
            min_samples_split = trial.suggest_int("min_samples_split", 2, 10) if hasattr(trial, "suggest_int") else params_source.get("min_samples_split", 2)
            
            if self.problem_type == "classification":
                return RandomForestClassifier(max_depth=max_depth, n_estimators=n_estimators, min_samples_split=min_samples_split, random_state=42, n_jobs=2)
            else:
                return RandomForestRegressor(max_depth=max_depth, n_estimators=n_estimators, min_samples_split=min_samples_split, random_state=42, n_jobs=2)
                
        elif model_name == "XGBoost":
            from xgboost import XGBClassifier, XGBRegressor
            max_depth = trial.suggest_int("max_depth", 3, 15) if hasattr(trial, "suggest_int") else params_source.get("max_depth", 6)
            learning_rate = trial.suggest_float("learning_rate", 1e-3, 0.3, log=True) if hasattr(trial, "suggest_float") else params_source.get("learning_rate", 0.1)
            n_estimators = trial.suggest_int("n_estimators", 50, 200) if hasattr(trial, "suggest_int") else params_source.get("n_estimators", 100)
            
            if self.problem_type == "classification":
                return XGBClassifier(max_depth=max_depth, learning_rate=learning_rate, n_estimators=n_estimators, use_label_encoder=False, eval_metric="logloss", random_state=42, n_jobs=2)
            else:
                return XGBRegressor(max_depth=max_depth, learning_rate=learning_rate, n_estimators=n_estimators, random_state=42, n_jobs=2)
                
        elif model_name == "LightGBM":
            from lightgbm import LGBMClassifier, LGBMRegressor
            max_depth = trial.suggest_int("max_depth", 3, 15) if hasattr(trial, "suggest_int") else params_source.get("max_depth", -1)
            learning_rate = trial.suggest_float("learning_rate", 1e-3, 0.3, log=True) if hasattr(trial, "suggest_float") else params_source.get("learning_rate", 0.1)
            num_leaves = trial.suggest_int("num_leaves", 15, 63) if hasattr(trial, "suggest_int") else params_source.get("num_leaves", 31)
            n_estimators = trial.suggest_int("n_estimators", 50, 200) if hasattr(trial, "suggest_int") else params_source.get("n_estimators", 100)
            
            if self.problem_type == "classification":
                return LGBMClassifier(max_depth=max_depth, learning_rate=learning_rate, num_leaves=num_leaves, n_estimators=n_estimators, random_state=42, n_jobs=2, verbose=-1)
            else:
                return LGBMRegressor(max_depth=max_depth, learning_rate=learning_rate, num_leaves=num_leaves, n_estimators=n_estimators, random_state=42, n_jobs=2, verbose=-1)
                
        return None

