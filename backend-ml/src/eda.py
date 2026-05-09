import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import os

import pandas as pd
import numpy as np
import re

import json
import traceback

def analyze_target_column(df: pd.DataFrame):
    """
    Analyzes the dataset to find the most likely target column using statistics.
    Gemini is disabled as the API key is exhausted.
    """
    print("\nAnalyzing dataset for target column using statistical heuristics...\n")
    df = df.copy()

    # Step 1: Remove constant columns
    df = df.loc[:, df.nunique() > 1]
    
    # Step 2: Heuristic Analysis
    # Usually the last column is the target
    best_col = df.columns[-1]
    
    # Problem type based on cardinality
    unique_count = df[best_col].nunique()
    if not pd.api.types.is_numeric_dtype(df[best_col]) or unique_count < 10:
        problem_type = "classification"
    else:
        problem_type = "regression"
        
    ranked = [(best_col, 10)]
    
    return best_col, problem_type, ranked


def plot_target_distribution(df, target_column, problem_type):

    print("\nGenerating target distribution plot...\n")

    # create outputs folder if not exists
    os.makedirs("outputs", exist_ok=True)

    plt.figure(figsize=(8,5), facecolor='none')

    if problem_type == "classification":
        ax = sns.countplot(x=df[target_column])
        plt.title(f"Target Distribution: {target_column}", color='white')
    else:  # regression
        ax = sns.histplot(df[target_column], kde=True)
        plt.title(f"Target Distribution: {target_column}", color='white')

    ax.tick_params(colors='white')
    plt.setp(ax.get_xticklabels(), color='white')
    plt.tight_layout()
    plt.savefig("outputs/target_distribution.png", transparent=True)
    plt.close()

    print("Target distribution plot saved in outputs folder")

def plot_correlation_heatmap(df):

    print("\nGenerating correlation heatmap...\n")

    # create outputs folder if not exists
    os.makedirs("outputs", exist_ok=True)

    # select only numeric columns
    numeric_df = df.select_dtypes(include='number')

    if numeric_df.shape[1] < 2:
        print("Not enough numeric columns for correlation heatmap")
        return

    # correlation matrix
    corr_matrix = numeric_df.corr()

    plt.figure(figsize=(10, 7), facecolor='none')
    ax = sns.heatmap(corr_matrix, annot=True, cmap="coolwarm", fmt=".2f")
    plt.title("Correlation Heatmap", color='white')
    
    # Customize tick colors
    ax.tick_params(colors='white')
    plt.setp(plt.getp(ax, 'xticklabels'), color='white')
    plt.setp(plt.getp(ax, 'yticklabels'), color='white')

    plt.tight_layout()
    plt.savefig("outputs/correlation_heatmap.png", transparent=True)
    plt.close()

    print("Correlation heatmap saved in outputs folder")

def plot_feature_distributions(df):

    print("\nGenerating feature distribution plots...\n")

    import matplotlib.pyplot as plt
    import seaborn as sns
    import os

    os.makedirs("outputs", exist_ok=True)

    numeric_df = df.select_dtypes(include='number')

    if numeric_df.shape[1] == 0:
        print("No numeric columns found")
        return

    num_cols = numeric_df.columns
    total = len(num_cols)

    # grid size
    cols = 3
    rows = (total // cols) + 1

    plt.figure(figsize=(15, 5 * rows), facecolor='none')

    for i, column in enumerate(num_cols, 1):
        ax = plt.subplot(rows, cols, i)
        sns.histplot(numeric_df[column], kde=True)
        plt.title(column, color='white')
        ax.tick_params(colors='white')
        plt.setp(ax.get_xticklabels(), color='white')
        plt.setp(ax.get_yticklabels(), color='white')

    plt.tight_layout()
    plt.savefig("outputs/feature_distributions.png", transparent=True)
    plt.close()

    print("Feature distribution plots saved")
