from rag.store_memory import store_training_memory

store_training_memory(
    dataset_name="house_price",
    model_name="RandomForest",
    accuracy="89%",
    target="price",
    insights="Area and location are most important features"
)
