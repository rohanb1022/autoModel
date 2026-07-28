import pandas as pd

def handle_missing_values(df: pd.DataFrame):

    print("\nHandling missing values...\n")

    for column in df.columns:
        df[column] = df[column].replace(["", "nan", "NaN", "None", "null", "NULL", "N/A", "n/a"], pd.NA)
        missing_count = df[column].isnull().sum()

        if missing_count == len(df):
            if pd.api.types.is_numeric_dtype(df[column]):
                df[column] = df[column].fillna(0)
            else:
                df[column] = df[column].fillna("Unknown")
            continue

        if missing_count > 0:
            print(f"{column}: {missing_count} missing values")

            if pd.api.types.is_numeric_dtype(df[column]):
                median_value = df[column].median()
                if pd.isna(median_value):
                    median_value = 0
                df[column] = df[column].fillna(median_value)
                print(f"Filled with median: {median_value}")

            else:
                mode_series = df[column].dropna().mode()

                if not mode_series.empty and not pd.isna(mode_series[0]):
                    mode_value = mode_series[0]
                    df[column] = df[column].fillna(mode_value)
                    print(f"Filled with mode: {mode_value}")
                else:
                    df[column] = df[column].fillna("Unknown")
                    print("Filled with: Unknown")

            print("-----")

    return df


def remove_duplicates(df: pd.DataFrame):
    print("\nRemoving duplicates...\n")

    initial_rows = len(df)
    df = df.drop_duplicates()
    removed_rows = initial_rows - len(df)

    print(f"Removed {removed_rows} duplicate rows")
    print(f"Remaining rows: {len(df)}")

    return df

def clean_formatted_numbers(df: pd.DataFrame):
    for col in df.columns:
        if df[col].dtype == object or str(df[col].dtype) == 'category':
            
            # Remove symbols
            cleaned = df[col].astype(str).str.replace(r'[\$,%,]', '', regex=True)
            
            # Try converting safely
            numeric_col = pd.to_numeric(cleaned, errors='coerce')
            
            # Only convert if MOST values are numeric
            non_null_ratio = numeric_col.notnull().sum() / len(df)
            
            if non_null_ratio > 0.8:
                df[col] = numeric_col
                print(f"Converted to numeric: {col}")
    
    return df

def basic_cleaning(df):
    df = clean_formatted_numbers(df)
    df = handle_missing_values(df)
    df = remove_duplicates(df)
    return df
