import joblib
import pandas as pd

# loading the model which we dumped using joblib.dump
def load_model():
    model = joblib.load("outputs/best_model.pkl")
    return model

# some preprocessing step like checking for the target column and encoding
# encoding envolves converting categorical data into numerical data (hot encoding)
def preprocess_for_prediction(df, target_column, training_columns):

    # remove target if exists
    if target_column in df.columns:
        df = df.drop(columns=[target_column])

    # same encoding as training
    df = pd.get_dummies(df, drop_first=True)

    # align with training columns
    df = df.reindex(columns=training_columns, fill_value=0)

    return df

# predicting using the model
def predict(model, processed_df):

    preds = model.predict(processed_df)
    return preds
