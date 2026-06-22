import numpy as np
import pandas as pd
import os

class ModelExplainer:
    def __init__(self, model, X_train: pd.DataFrame, output_dir="outputs"):
        self.model = model
        self.X_train = X_train
        self.output_dir = output_dir
        if not os.path.exists(self.output_dir):
            os.makedirs(self.output_dir)
            
    def explain(self):
        # Unwrap TransformedTargetRegressor if present
        target_model = self.model
        if hasattr(self.model, "regressor_"):
            target_model = self.model.regressor_
            
        try:
            feature_names = list(self.X_train.columns)
            importances = []
            
            # Extract importances/coefficients depending on model type
            if hasattr(target_model, "input_layer"):
                # PyTorch AetherANN model
                first_layer = target_model.input_layer[0]
                if hasattr(first_layer, "weight"):
                    import torch
                    with torch.no_grad():
                        importances = torch.mean(torch.abs(first_layer.weight), dim=0).cpu().numpy()
                else:
                    importances = np.zeros(len(feature_names))
            elif hasattr(target_model, "feature_importances_"):
                importances = target_model.feature_importances_
            elif hasattr(target_model, "coef_"):
                coef = target_model.coef_
                # Handle multi-class outputs format where coef is 2D
                if len(coef.shape) > 1:
                    importances = np.mean(np.abs(coef), axis=0)
                else:
                    importances = np.abs(coef)
            elif hasattr(target_model, "cluster_centers_"):
                # Unsupervised clustering: use variance of features across centers
                importances = np.var(target_model.cluster_centers_, axis=0)
            elif hasattr(target_model, "means_"):
                # Gaussian Mixture: use variance of features across component means
                importances = np.var(target_model.means_, axis=0)
            else:
                # Default fallback — uniform importances
                importances = np.zeros(len(feature_names))
                
            # Normalize importances so they sum to 1.0
            sum_imp = np.sum(importances)
            if sum_imp > 0:
                importances = importances / sum_imp
                
            # Create sorted list
            indices = np.argsort(importances)[::-1]
            top_features = [{"feature": str(feature_names[i]), "importance": float(importances[i])} for i in indices[:10]]
            
            return {
                "top_features": top_features,
                "status": "success"
            }
            
        except Exception as e:
            print(f"Feature Importance Explainer Error: {e}")
            return {
                "top_features": [],
                "status": "error",
                "message": str(e)
            }

