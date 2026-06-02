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
        notes,
        all_columns,
        dropped_columns
    }
    """

    text = f"""
        DATASET REPORT
        Dataset Name: {data.get('dataset_name', 'N/A')}
        Rows: {data.get('rows', 'N/A')}
        Columns (Count): {data.get('columns', 'N/A')}
        All Columns: {', '.join(data.get('all_columns', []))}
        Useless/Dropped Columns: {', '.join(data.get('dropped_columns', [])) if data.get('dropped_columns') else 'None'}
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

    # Delete any existing memory for this user so the chatbot only remembers the latest dataset
    try:
        collection.delete(where={"user_id": user_id})
    except Exception as e:
        print(f"Error clearing previous memory: {e}")

    collection.add(
        documents=[text],
        embeddings=[embedding],
        metadatas=[{"user_id": user_id}],
        ids=[str(uuid.uuid4())]
    )

    print("Training memory stored")
