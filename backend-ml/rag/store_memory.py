from rag.embedder import get_embedding
from rag.vectordb import store_embedding
import uuid

def store_training_memory(dataset_name, model_name, accuracy, target, insights):
    
    text = f"""
    Dataset: {dataset_name}
    Target column: {target}
    Best Model: {model_name}
    Accuracy: {accuracy}
    Insights: {insights}
    """

    embedding = get_embedding(text)
    unique_id = str(uuid.uuid4())

    store_embedding(unique_id, embedding, text)

    print("Memory stored in vector DB")
