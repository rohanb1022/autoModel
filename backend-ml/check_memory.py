from rag.vectordb import collection

data = collection.get()

print("\nStored documents:\n")
for doc in data["documents"]:
    print(doc)
    print("------")
