import torch
import torch.nn as nn

class AetherANN(nn.Module):
    """
    A dynamic Artificial Neural Network (ANN) using PyTorch.
    Adapts its hidden layer sizes based on the number of input features.
    Supports regression, binary classification, and multi-class classification.
    """
    def __init__(self, input_features: int, output_size: int):
        super().__init__()
        
        # Calculate dynamic hidden sizes
        self.hidden_size_1 = min(128, max(32, input_features * 2))
        self.hidden_size_2 = self.hidden_size_1 // 2
        
        # Layer definitions
        self.input_layer = nn.Sequential(
            nn.Linear(input_features, self.hidden_size_1),
            nn.ReLU(),
            nn.Dropout(0.2)
        )
        
        self.hidden_layer = nn.Sequential(
            nn.Linear(self.hidden_size_1, self.hidden_size_2),
            nn.ReLU(),
            nn.Dropout(0.2)
        )
        
        self.output_layer = nn.Linear(self.hidden_size_2, output_size)
        
    def forward(self, x: torch.Tensor) -> torch.Tensor:
        x = self.input_layer(x)
        x = self.hidden_layer(x)
        x = self.output_layer(x)
        return x
