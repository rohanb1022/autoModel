import pandas as pd
import numpy as np
from typing import Dict, Any, List, Optional

class DatasetProfiler:
    def __init__(self, df: pd.DataFrame, target_column: Optional[str] = None, problem_type: Optional[str] = None):
        self.df = df
        self.target_column = target_column
        self.problem_type = problem_type
        
    def profile(self) -> Dict[str, Any]:
        warnings = []
        
        # 1. Missing Values
        missing = self.df.isnull().sum()
        missing_dict = {str(k): int(v) for k, v in missing[missing > 0].to_dict().items()}
        for col, count in missing_dict.items():
            warnings.append(f"Column '{col}' has {count} missing values")
            
        # 2. Duplicates
        duplicates_count = int(self.df.duplicated().sum())
        if duplicates_count > 0:
            warnings.append(f"Dataset contains {duplicates_count} duplicate rows")
            
        # 3. ID Columns & Constant Columns & High-Cardinality Categorical Columns
        id_cols = []
        for col in self.df.columns:
            if col == self.target_column:
                continue
            
            n_unique = self.df[col].nunique()
            total_rows = len(self.df)
            
            # Constant Columns
            if n_unique <= 1:
                warnings.append(f"Column '{col}' has only a constant value")
                continue
                
            # ID Columns
            col_lower = str(col).lower()
            is_id_name = any(pattern in col_lower for pattern in ['id', 'key', 'index', 'pk', 'unnamed', 'serial'])
            is_strictly_unique = (n_unique == total_rows)
            
            if is_strictly_unique and (pd.api.types.is_numeric_dtype(self.df[col]) or is_id_name):
                id_cols.append(col)
                warnings.append(f"Column '{col}' appears to be an identifier")
                
            # High-Cardinality Categorical Columns
            if pd.api.types.is_object_dtype(self.df[col]) or pd.api.types.is_categorical_dtype(self.df[col]):
                if n_unique > 50:
                    warnings.append(f"Categorical column '{col}' has high cardinality ({n_unique} unique values)")
                    
        # 4. Class Imbalance (Classification)
        class_imbalance_detected = False
        if self.problem_type == "classification" and self.target_column and self.target_column in self.df.columns:
            y = self.df[self.target_column].dropna()
            if y.nunique() >= 2:
                value_counts = y.value_counts(normalize=True).to_dict()
                min_class_ratio = min(value_counts.values()) if value_counts else 0
                if min_class_ratio < 0.1:
                    class_imbalance_detected = True
                    warnings.append("Target distribution is highly imbalanced (minority class < 10%)")
                    
        # 5. Data Leakage Risks
        if self.target_column and self.target_column in self.df.columns:
            y = self.df[self.target_column]
            if pd.api.types.is_numeric_dtype(y):
                for col in self.df.columns:
                    if col == self.target_column or not pd.api.types.is_numeric_dtype(self.df[col]):
                        continue
                    # Drop NaN for correlation check
                    temp_df = self.df[[col, self.target_column]].dropna()
                    if len(temp_df) > 1:
                        corr = temp_df[col].corr(temp_df[self.target_column])
                        if abs(corr) > 0.95:
                            warnings.append(f"Column '{col}' has extremely high correlation ({corr:.2f}) with the target, indicating a data leakage risk")
                            
        report = {
            "rows": int(len(self.df)),
            "columns": int(len(self.df.columns)),
            "missing_values": missing_dict,
            "duplicates": duplicates_count,
            "class_imbalance": class_imbalance_detected if self.problem_type == "classification" else None,
            "warnings": warnings
        }
        return report

