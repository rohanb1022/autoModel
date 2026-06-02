import pandas as pd
from src.data_loader import load_dataset, basic_info, missing_values, data_types, preview_data
from src.data_cleaning import basic_cleaning
from src.eda import analyze_target_column
from src.eda import analyze_target_column , plot_target_distribution , plot_correlation_heatmap , plot_feature_distributions
from src.train import prepare_data , train_models
from src.predict import load_model , predict , preprocess_for_prediction


def main():
    path = "data/sample.csv"
    
    df = load_dataset(path)
    
    if df is not None:
        preview_data(df)
        basic_info(df)
        missing_values(df)
        data_types(df)
        df = basic_cleaning(df)
        target_column, problem_type, ranked = analyze_target_column(df)
        print("\nTarget column:", target_column)
        print("Problem type:", problem_type)
        plot_target_distribution(df, target_column, problem_type)
        plot_correlation_heatmap(df)
        plot_feature_distributions(df)
        X_train, X_test, y_train, y_test, dropped_cols = prepare_data(df, target_column)
        best_model_name, best_score, top_features = train_models(X_train, X_test, y_train, y_test, problem_type)
        print("\nBest model:", best_model_name)
        print("Best score:", best_score)
        print("Top features:", top_features)
        model = load_model()
        
        print("\n=== TESTING PREDICTION PIPELINE ===\n")

        model = load_model()
        sample = df.sample(5).copy()
        actual = sample[target_column]
        processed = preprocess_for_prediction(sample, target_column, X_train.columns)
        preds = predict(model, processed)

        print("Predicted:", preds)
        print("Actual:   ", actual.values)

        
if __name__ == "__main__":
    main()
