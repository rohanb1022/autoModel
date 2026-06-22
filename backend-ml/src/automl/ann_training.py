import random
import copy
import numpy as np
import pandas as pd
import torch
import torch.nn as nn
from torch.utils.data import TensorDataset, DataLoader
from sklearn.model_selection import train_test_split
from src.automl.ann_models import AetherANN

def set_seeds(seed: int = 42):
    """
    Sets random seeds for reproducibility across Python, NumPy, and PyTorch.
    """
    random.seed(seed)
    np.random.seed(seed)
    torch.manual_seed(seed)
    if torch.cuda.is_available():
        torch.cuda.manual_seed(seed)
        torch.cuda.manual_seed_all(seed)
        # Ensure deterministic behavior
        torch.backends.cudnn.deterministic = True
        torch.backends.cudnn.benchmark = False

def get_device() -> str:
    """
    Detects and returns the available device (cuda if GPU is available, else cpu).
    """
    return "cuda" if torch.cuda.is_available() else "cpu"

def train_ann(
    X_train: pd.DataFrame,
    y_train: pd.Series,
    problem_type: str,
    epochs: int = 100,
    batch_size: int = 32,
    learning_rate: float = 0.001,
    patience: int = 10,
    seed: int = 42
):
    """
    Trains a dynamic PyTorch ANN model on the provided dataset.
    Implements validation split, reproducible seeds, DataLoader batching, and early stopping.
    """
    # 1. Set seeds for reproducibility
    set_seeds(seed)
    
    # 2. Determine device
    device = get_device()
    print(f"[ANN TRAINING] Training on device: {device}")
    
    # 3. Create validation split (20% of training set)
    if problem_type == "classification":
        try:
            X_tr, X_val, y_tr, y_val = train_test_split(
                X_train, y_train, test_size=0.2, random_state=seed, stratify=y_train
            )
        except Exception:
            # Fallback if stratification is not possible
            X_tr, X_val, y_tr, y_val = train_test_split(
                X_train, y_train, test_size=0.2, random_state=seed
            )
    else:
        X_tr, X_val, y_tr, y_val = train_test_split(
            X_train, y_train, test_size=0.2, random_state=seed
        )
        
    # Determine outputs and classes
    input_features = X_tr.shape[1]
    
    if problem_type == "regression":
        output_size = 1
        loss_fn = nn.MSELoss()
        
        # Prepare targets (float32, 2D)
        y_tr_t = torch.tensor(y_tr.values, dtype=torch.float32).unsqueeze(1)
        y_val_t = torch.tensor(y_val.values, dtype=torch.float32).unsqueeze(1)
        
    elif problem_type == "classification":
        num_classes = len(np.unique(y_train))
        
        if num_classes <= 2:
            output_size = 1
            loss_fn = nn.BCEWithLogitsLoss()
            # Prepare targets (float32, 2D)
            y_tr_t = torch.tensor(y_tr.values, dtype=torch.float32).unsqueeze(1)
            y_val_t = torch.tensor(y_val.values, dtype=torch.float32).unsqueeze(1)
        else:
            output_size = num_classes
            loss_fn = nn.CrossEntropyLoss()
            # Prepare targets (long, 1D)
            y_tr_t = torch.tensor(y_tr.values, dtype=torch.long)
            y_val_t = torch.tensor(y_val.values, dtype=torch.long)
            
    else:
        raise ValueError(f"Unsupported problem type: {problem_type}")
        
    # 4. Create TensorDatasets & DataLoaders
    X_tr_t = torch.tensor(X_tr.values, dtype=torch.float32)
    X_val_t = torch.tensor(X_val.values, dtype=torch.float32)
    
    train_dataset = TensorDataset(X_tr_t, y_tr_t)
    val_dataset = TensorDataset(X_val_t, y_val_t)
    
    train_loader = DataLoader(train_dataset, batch_size=batch_size, shuffle=True)
    
    # 5. Initialize Model, Optimizer
    model = AetherANN(input_features=input_features, output_size=output_size)
    model = model.to(device)
    
    optimizer = torch.optim.Adam(model.parameters(), lr=learning_rate)
    
    # 6. Training Loop with Early Stopping
    best_val_loss = float('inf')
    best_model_state = None
    patience_counter = 0
    epochs_completed = 0
    
    print(f"[ANN TRAINING] Architecture: hidden_size_1={model.hidden_size_1}, hidden_size_2={model.hidden_size_2}, outputs={output_size}")
    
    for epoch in range(epochs):
        model.train()
        train_loss = 0.0
        
        for batch_x, batch_y in train_loader:
            batch_x, batch_y = batch_x.to(device), batch_y.to(device)
            
            optimizer.zero_grad()
            outputs = model(batch_x)
            loss = loss_fn(outputs, batch_y)
            loss.backward()
            optimizer.step()
            
            train_loss += loss.item() * batch_x.size(0)
            
        train_loss /= len(train_loader.dataset)
        
        # Validation evaluation
        model.eval()
        val_loss = 0.0
        
        with torch.no_grad():
            X_val_t_dev = X_val_t.to(device)
            y_val_t_dev = y_val_t.to(device)
            val_outputs = model(X_val_t_dev)
            val_loss = loss_fn(val_outputs, y_val_t_dev).item()
            
        epochs_completed = epoch + 1
        
        # Monitor validation loss improvement
        if val_loss < best_val_loss:
            best_val_loss = val_loss
            patience_counter = 0
            best_model_state = copy.deepcopy(model.state_dict())
        else:
            patience_counter += 1
            
        if (epoch + 1) % 10 == 0 or epoch == 0 or patience_counter >= patience:
            print(f"Epoch {epoch+1:03d}/{epochs:03d} | Train Loss: {train_loss:.4f} | Val Loss: {val_loss:.4f} | Best Val Loss: {best_val_loss:.4f}")
            
        if patience_counter >= patience:
            print(f"[ANN TRAINING] Early stopping triggered. Validation loss did not improve for {patience} epochs.")
            break
            
    # Load best model weights
    if best_model_state is not None:
        model.load_state_dict(best_model_state)
        
    num_params = sum(p.numel() for p in model.parameters() if p.requires_grad)
    
    # Pack training details
    training_details = {
        "architecture": f"Input ({input_features}) -> Linear ({model.hidden_size_1}) -> ReLU -> Dropout(0.2) -> Linear ({model.hidden_size_2}) -> ReLU -> Dropout(0.2) -> Linear ({output_size})",
        "num_params": num_params,
        "epochs_completed": epochs_completed,
        "early_stopping_triggered": patience_counter >= patience,
        "final_val_loss": best_val_loss
    }
    
    return model, training_details
