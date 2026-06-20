import pandas as pd
import matplotlib
matplotlib.use('Agg')
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

    plt.figure(figsize=(10, 6), facecolor='white')
    sns.set_theme(style="whitegrid")

    if problem_type == "classification":
        # Sort values to make plot clean
        val_counts = df[target_column].value_counts()
        ax = sns.countplot(
            x=df[target_column],
            palette="crest",
            order=val_counts.index
        )
        plt.title(f"Target Distribution: {target_column}", fontsize=16, fontweight='bold', pad=15, color='#0f172a')
        
        # Add labels on top of bars
        for p in ax.patches:
            height = p.get_height()
            ax.annotate(f'{int(height)}',
                        (p.get_x() + p.get_width() / 2., height),
                        ha='center', va='bottom',
                        fontsize=11, color='#1e293b',
                        xytext=(0, 5),
                        textcoords='offset points')
    else:  # regression
        ax = sns.histplot(df[target_column], kde=True, color='#4b41e1', bins=30)
        plt.title(f"Target Distribution: {target_column} (Density)", fontsize=16, fontweight='bold', pad=15, color='#0f172a')

    plt.xlabel(target_column, fontsize=12, fontweight='semibold', color='#1e293b', labelpad=10)
    plt.ylabel("Count / Frequency", fontsize=12, fontweight='semibold', color='#1e293b', labelpad=10)
    
    plt.xticks(fontsize=11, color='#334155')
    plt.yticks(fontsize=11, color='#334155')
    
    plt.grid(True, linestyle="--", alpha=0.5, color="#cbd5e1")
    plt.tight_layout()
    plt.savefig("outputs/target_distribution.png", dpi=150, facecolor='white')
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

    # Limit to top 12 features with standard deviation to prevent visual clutter
    if numeric_df.shape[1] > 12:
        top_cols = numeric_df.std().nlargest(12).index
        numeric_df = numeric_df[top_cols]

    # correlation matrix
    corr_matrix = numeric_df.corr()

    size = max(8, min(14, numeric_df.shape[1] * 1.1))
    plt.figure(figsize=(size, size * 0.8), facecolor='white')
    sns.set_theme(style="white")

    ax = sns.heatmap(
        corr_matrix, 
        annot=True, 
        cmap="coolwarm", 
        fmt=".2f",
        annot_kws={"size": 10, "weight": "bold"},
        linewidths=.5,
        cbar_kws={"shrink": .8}
    )
    
    plt.title("Feature Correlation Matrix", fontsize=16, fontweight='bold', pad=20, color='#0f172a')
    
    plt.xticks(rotation=45, ha='right', fontsize=11, color='#334155', fontweight='semibold')
    plt.yticks(rotation=0, fontsize=11, color='#334155', fontweight='semibold')

    plt.tight_layout()
    plt.savefig("outputs/correlation_heatmap.png", dpi=150, facecolor='white')
    plt.close()

    print("Correlation heatmap saved in outputs folder")

def plot_feature_distributions(df):

    print("\nGenerating feature distribution plots...\n")

    # create outputs folder if not exists
    os.makedirs("outputs", exist_ok=True)

    numeric_df = df.select_dtypes(include='number')

    if numeric_df.shape[1] == 0:
        print("No numeric columns found")
        return

    # Limit to top 9 features with standard deviation to prevent visual clutter
    num_cols = list(numeric_df.columns)
    if len(num_cols) > 9:
        num_cols = list(numeric_df.std().nlargest(9).index)

    total = len(num_cols)
    cols = min(3, total)
    rows = (total + cols - 1) // cols

    plt.figure(figsize=(15, 4.5 * rows), facecolor='white')
    sns.set_theme(style="whitegrid")

    for i, column in enumerate(num_cols, 1):
        ax = plt.subplot(rows, cols, i)
        sns.histplot(numeric_df[column], kde=True, color='#4b41e1', bins=20)
        
        plt.title(f"Distribution of {column}", fontsize=13, fontweight='bold', color='#0f172a', pad=10)
        plt.xlabel(column, fontsize=11, color='#334155')
        plt.ylabel("Frequency", fontsize=11, color='#334155')
        
        plt.xticks(fontsize=10, color='#475569')
        plt.yticks(fontsize=10, color='#475569')
        plt.grid(True, linestyle="--", alpha=0.5, color="#cbd5e1")

    plt.tight_layout(pad=3.0)
    plt.savefig("outputs/feature_distributions.png", dpi=150, facecolor='white')
    plt.close()

    print("Feature distribution plots saved")

def plot_missing_values(df):

    print("\nGenerating missing values plot...\n")

    # create outputs folder if not exists
    os.makedirs("outputs", exist_ok=True)

    # Calculate missing percentages
    missing_pct = (df.isnull().sum() / len(df)) * 100
    missing_pct = missing_pct[missing_pct > 0]

    plt.figure(figsize=(10, 6), facecolor='white')
    sns.set_theme(style="whitegrid")

    if len(missing_pct) == 0:
        # Show a beautiful success bar chart
        plt.bar(["All Columns"], [100], color="#10b981", width=0.4)
        plt.title("Data Completeness (Missing Values)", fontsize=16, fontweight='bold', pad=15, color='#0f172a')
        plt.ylabel("Completeness Percentage (%)", fontsize=12, fontweight='semibold', color='#1e293b', labelpad=10)
        plt.ylim(0, 110)
        plt.text(0, 102, "100% Complete (No Missing Values)", ha='center', va='bottom', fontsize=12, fontweight='bold', color="#10b981")
    else:
        # Plot missing values percentage
        missing_pct = missing_pct.sort_values(ascending=False)
        ax = sns.barplot(x=missing_pct.values, y=missing_pct.index, palette="flare")
        plt.title("Data Incompleteness (Missing Values %)", fontsize=16, fontweight='bold', pad=15, color='#0f172a')
        plt.xlabel("Percentage Missing (%)", fontsize=12, fontweight='semibold', color='#1e293b', labelpad=10)
        plt.ylabel("Columns", fontsize=12, fontweight='semibold', color='#1e293b', labelpad=10)
        plt.xlim(0, max(100, max(missing_pct.values) * 1.15))
        
        # Annotate percentages
        for i, v in enumerate(missing_pct.values):
            ax.text(v + 1, i, f"{v:.1f}%", va='center', fontsize=10, fontweight='bold', color='#1e293b')

    plt.xticks(fontsize=11, color='#334155')
    plt.yticks(fontsize=11, color='#334155')
    plt.grid(True, linestyle="--", alpha=0.5, color="#cbd5e1")
    plt.tight_layout()
    plt.savefig("outputs/missing_values.png", dpi=150, facecolor='white')
    plt.close()

    print("Missing values plot saved")

def plot_outliers_boxplot(df):

    print("\nGenerating outliers boxplot...\n")

    # create outputs folder if not exists
    os.makedirs("outputs", exist_ok=True)

    numeric_df = df.select_dtypes(include='number')
    if numeric_df.shape[1] == 0:
        print("No numeric columns found for outliers plot")
        return

    # Select top 6 features with highest standard deviation
    num_cols = list(numeric_df.columns)
    if len(num_cols) > 6:
        num_cols = list(numeric_df.std().nlargest(6).index)

    total = len(num_cols)
    cols = min(3, total)
    rows = (total + cols - 1) // cols

    plt.figure(figsize=(15, 4.5 * rows), facecolor='white')
    sns.set_theme(style="whitegrid")

    for i, column in enumerate(num_cols, 1):
        plt.subplot(rows, cols, i)
        sns.boxplot(x=numeric_df[column], color="#4b41e1", flierprops=dict(markerfacecolor='red', marker='D', markersize=5))
        plt.title(f"Outliers in {column}", fontsize=13, fontweight='bold', color='#0f172a', pad=10)
        plt.xlabel(column, fontsize=11, color='#334155')
        plt.grid(True, linestyle="--", alpha=0.5, color="#cbd5e1")

    plt.tight_layout(pad=3.0)
    plt.savefig("outputs/outliers_boxplot.png", dpi=150, facecolor='white')
    plt.close()

    print("Outliers boxplot saved")
