import pandas as pd

def load_dataset(path: str):
    try:
        df = pd.read_csv(path)
        print("\nDataset loaded successfully\n")
        return df
    except Exception as e:
        print("Error loading dataset:", e)
        return None


def basic_info(df: pd.DataFrame):
    print("Shape of dataset:", df.shape)
    print("\nColumns:")
    print(df.columns.tolist())


def missing_values(df: pd.DataFrame):
    print("\nMissing values:")
    print(df.isnull().sum())


def data_types(df: pd.DataFrame):
    print("\nData types:")
    print(df.dtypes)


def preview_data(df: pd.DataFrame):
    print("\nFirst 5 rows:")
    print(df.head())

