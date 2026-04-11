import chromadb

# persistent storage folder
client = chromadb.PersistentClient(path="./vector_db")

collection = client.get_or_create_collection(
    name="automodel_memory"
)

def search_embedding(query_embedding, n_results=5):
    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=n_results
    )
    return results["documents"]
