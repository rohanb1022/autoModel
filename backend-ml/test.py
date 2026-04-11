import pandas as pd
from src.data_cleaning import basic_cleaning
from src.eda import analyze_target_column
from src.train import prepare_data, train_models

df = pd.read_csv("temp.csv")
df = basic_cleaning(df)
target_column = "Price"
problem_type = "regression"

try:
    X_train, X_test, y_train, y_test = prepare_data(df, target_column)
    train_models(X_train, X_test, y_train, y_test, problem_type)
    print("SUCCESS")
except Exception as e:
    import traceback
    traceback.print_exc()
