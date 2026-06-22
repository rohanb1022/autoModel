import os
import joblib
import pandas as pd
import torch
from src.automl.ann_models import AetherANN

def load_model():
    """
    Loads the trained model. Supports PyTorch ANN (.pth) and scikit-learn (.pkl) formats.
    """
    pth_path = "outputs/best_model.pth"
    pkl_path = "outputs/best_model.pkl"
    
    if os.path.exists(pth_path):
        print(f"[PREDICT] Loading PyTorch model from {pth_path}")
        checkpoint = torch.load(pth_path, map_location="cpu", weights_only=False)
        
        arch_config = checkpoint["arch_config"]
        # Reconstruct the PyTorch model structure
        model = AetherANN(
            input_features=arch_config["input_features"],
            output_size=arch_config["output_size"]
        )
        model.load_state_dict(checkpoint["model_state_dict"])
        model.eval()
        
        # Attach inference metadata to model object
        model.is_pytorch = True
        model.problem_type = arch_config["problem_type"]
        model.scaler = checkpoint.get("scaler")
        model.label_encoder = checkpoint.get("label_encoder")
        model.training_columns = checkpoint.get("training_columns")
        return model
        
    elif os.path.exists(pkl_path):
        print(f"[PREDICT] Loading traditional model from {pkl_path}")
        model = joblib.load(pkl_path)
        model.is_pytorch = False
        
        # Attach scaler and label encoder if they exist
        scaler_path = "outputs/scaler.pkl"
        if os.path.exists(scaler_path):
            model.scaler = joblib.load(scaler_path)
        else:
            model.scaler = None
            
        le_path = "outputs/label_encoder.pkl"
        if os.path.exists(le_path):
            model.label_encoder = joblib.load(le_path)
        else:
            model.label_encoder = None
            
        return model
    else:
        raise FileNotFoundError("No trained model found in the outputs directory.")

def preprocess_for_prediction(df: pd.DataFrame, target_column: str, training_columns):
    """
    Cleans, encodes, aligns, and standardizes features for prediction.
    """
    # Remove target if present
    if target_column in df.columns:
        df = df.drop(columns=[target_column])

    # Convert categorical to numeric (same encoding as training)
    df = pd.get_dummies(df, drop_first=True)

    # Align with training columns
    df = df.reindex(columns=training_columns, fill_value=0)

    # Scale the features if scaler is available
    scaler_path = "outputs/scaler.pkl"
    if os.path.exists(scaler_path):
        try:
            scaler = joblib.load(scaler_path)
            scaled_data = scaler.transform(df)
            df = pd.DataFrame(scaled_data, columns=df.columns, index=df.index)
        except Exception as e:
            print(f"[PREDICT] Scaling failed during inference preprocessing: {e}")

    return df

def predict(model, processed_df: pd.DataFrame):
    """
    Performs inference on the processed DataFrame using the loaded model.
    Handles decoding classification indices to original labels if label encoder exists.
    """
    is_pytorch = getattr(model, "is_pytorch", False)
    
    if is_pytorch:
        from src.automl.ann_training import get_device
        device = get_device()
        model.to(device)
        model.eval()
        
        with torch.no_grad():
            x_tensor = torch.tensor(processed_df.values, dtype=torch.float32).to(device)
            logits = model(x_tensor)
            
            problem_type = getattr(model, "problem_type", "regression")
            
            if problem_type == "classification":
                output_size = logits.shape[1]
                if output_size == 1:
                    # Binary classification (BCE loss format): sigmoid and threshold
                    probs = torch.sigmoid(logits).cpu().numpy()
                    preds = (probs >= 0.5).astype(int).flatten()
                else:
                    # Multi-class classification (CrossEntropy loss format): argmax
                    preds = torch.argmax(logits, dim=1).cpu().numpy()
            else:
                # Regression
                preds = logits.cpu().numpy().flatten()
    else:
        # Traditional scikit-learn/xgboost/lightgbm prediction
        preds = model.predict(processed_df)
        
    # Decode predictions back to original classes if label encoder is available
    label_encoder = getattr(model, "label_encoder", None)
    if label_encoder is not None:
        try:
            # Check if predictions are integer indices before attempting decoding
            preds = label_encoder.inverse_transform(preds.astype(int))
        except Exception as e:
            print(f"[PREDICT] Decoding classes failed: {e}")
            
    return preds
