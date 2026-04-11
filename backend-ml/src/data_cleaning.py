import pandas as pd

def handle_missing_values(df: pd.DataFrame):

    print("\nHandling missing values...\n")

    for column in df.columns:
        missing_count = df[column].isnull().sum()

        if missing_count > 0:
            print(f"{column}: {missing_count} missing values")

            # numeric columns
            # .api is the python function which we are using here
            # it is necesarry we are using it over here that is because if we check manually we have to write for int64, int32 , float64, float32 etc
            # but with .api we can check for all the numeric types at once
            if pd.api.types.is_numeric_dtype(df[column]):
                median_value = df[column].median()
                df[column] = df[column].fillna(median_value)
                print(f"Filled with median: {median_value}")

            # categorical columns
            else:
                mode_series = df[column].mode()

                if not mode_series.empty:
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
    """
    Attempts to clean columns that are strings but actually represent formatted numbers (e.g. currency: '$13.97', '1,000.50').
    """
    for col in df.columns:
        if df[col].dtype == object or str(df[col].dtype) == 'category':
            try:
                # Remove dollar signs, commas, and percentage signs
                cleaned = df[col].astype(str).str.replace(r'[\$,%]', '', regex=True)
                # Parse to float
                numeric_col = pd.to_numeric(cleaned, errors='raise')
                df[col] = numeric_col
                print(f"Cleaned formatted numbers in column: {col}")
            except (ValueError, TypeError, AttributeError):
                continue
    return df

def basic_cleaning(df):
    df = clean_formatted_numbers(df)
    df = handle_missing_values(df)
    df = remove_duplicates(df)
    return df
