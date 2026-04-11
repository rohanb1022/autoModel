from rag.embedder import get_embedding
from rag.vectordb import collection
import uuid

def store_training_memory(user_id : str ,  data : dict):
    """
    data = {
        dataset_name,
        rows,
        columns,
        target,
        problem_type,
        best_model,
        accuracy,
        f1_score,
        notes
    }
    """

    text = f"""
        DATASET REPORT
        Dataset Name: {data.get('dataset_name', 'N/A')}
        Rows: {data.get('rows', 'N/A')}
        Columns: {data.get('columns', 'N/A')}
        Target Column: {data.get('target', 'N/A')}
        Problem Type: {data.get('problem_type', 'N/A')}
        
        MODEL PERFORMANCE
        Best Model: {data.get('best_model', 'N/A')}
        Accuracy: {data.get('accuracy', data.get('score', 'N/A'))}
        F1 Score: {data.get('f1_score', 'N/A')}
        
        NOTES
        {data.get('notes', 'No notes.')}
        """


    embedding = get_embedding(text)

    collection.add(
        documents=[text],
        metadatas=[{"user_id": user_id}],
        ids=[str(uuid.uuid4())]
    )

    print("Training memory stored")
