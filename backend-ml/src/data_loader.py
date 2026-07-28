import io
import pandas as pd

def smart_load_csv(content: bytes) -> pd.DataFrame:
    """
    Robustly loads CSV bytes from external sources:
    - Automatically detects encodings (utf-8-sig, utf-8, latin1, cp1252)
    - Automatically detects separators (comma, semicolon, tab, pipe)
    - Cleans column names (strips BOM \\ufeff, quotes, spaces)
    - Replaces common null indicators ('N/A', 'na', 'null', 'None', '?', '-') with actual NaN
    """
    encodings = ['utf-8-sig', 'utf-8', 'latin1', 'cp1252']
    df = None
    
    for encoding in encodings:
        try:
            text = content.decode(encoding)
            for sep in [None, ',', ';', '\t', '|']:
                try:
                    if sep is None:
                        temp_df = pd.read_csv(
                            io.StringIO(text), 
                            sep=None, 
                            engine='python',
                            na_values=['N/A', 'n/a', 'NA', 'na', 'null', 'Null', 'NULL', 'None', 'none', '?', '-']
                        )
                    else:
                        temp_df = pd.read_csv(
                            io.StringIO(text), 
                            sep=sep,
                            na_values=['N/A', 'n/a', 'NA', 'na', 'null', 'Null', 'NULL', 'None', 'none', '?', '-']
                        )
                    
                    if temp_df is not None and temp_df.shape[1] >= 2 and temp_df.shape[0] > 0:
                        df = temp_df
                        break
                except Exception:
                    continue
            if df is not None:
                break
        except Exception:
            continue
            
    if df is None:
        df = pd.read_csv(io.BytesIO(content))
        
    df.columns = df.columns.astype(str).str.strip().str.replace('\ufeff', '')
    
    for col in df.select_dtypes(include=['object']).columns:
        df[col] = df[col].astype(str).str.strip()
        df[col] = df[col].replace({'nan': pd.NA, 'None': pd.NA, 'NULL': pd.NA, 'null': pd.NA, '': pd.NA})
        
    return df

def load_dataset(path: str):
    try:
        with open(path, 'rb') as f:
            content = f.read()
        df = smart_load_csv(content)
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

