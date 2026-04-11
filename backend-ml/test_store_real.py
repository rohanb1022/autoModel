from rag.store_training_memory import store_training_memory

store_training_memory({
    "dataset_name": "customer_churn",
    "rows": 5000,
    "columns": 12,
    "target": "churn",
    "problem_type": "classification",
    "best_model": "RandomForest",
    "accuracy": 0.91,
    "f1_score": 0.89,
    "notes": "RandomForest performed best with tuned parameters"
})
