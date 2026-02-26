import os
import json
from dotenv import load_dotenv
from langchain_core.documents import Document
from langchain_openai import OpenAIEmbeddings
from langchain_qdrant import QdrantVectorStore
from langchain_text_splitters import RecursiveCharacterTextSplitter

load_dotenv()

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(BASE_DIR, "dispense_all_products.json")

with open(DATA_PATH, "r", encoding="utf-8") as f:
    products = json.load(f)

# Embedding model
embedding_model = OpenAIEmbeddings(
    model="text-embedding-3-large"
)

# Convert products into LangChain Documents
# If JSON is wrapped like { "products": [...] }
if isinstance(products, dict):
    products = products.get("products", [])

text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=500, 
    chunk_overlap=50
)

documents = []

for product in products:
    # Safely get nested data to avoid 'NoneType' errors
    labs_data = product.get('labs') or {}
    brand_data = product.get('brand') or {}
    
    # Clean THC formatting: prevents "None%" in the UI
    thc_value = labs_data.get('thc')
    thc_display = f"{thc_value}%" if thc_value else "N/A"

    description = str(product.get("description") or "")
    
    # 2. Split the description into chunks
    chunks = text_splitter.split_text(description)

    for chunk in chunks:
        doc = Document(
            page_content=chunk,  
            metadata={
                "name": product.get("name"),
                "brand_name": brand_data.get("name"),
                "price": product.get("price"),
                "image": product.get("image"),
                "productUrl": product.get("productUrl"),
                "thc": thc_display,
                "category": product.get("productCategoryName"),
                "is_sale": product.get("priceType") == "SALE" or product.get("discountValue", 0) > 0
            },
        )
        documents.append(doc)

# Create / overwrite Qdrant collection
vector_db = QdrantVectorStore.from_documents(
    documents=documents,
    embedding=embedding_model,
    url="http://localhost:6333",
    collection_name="learning_vectors",
)

print("✅ Indexing complete. Vectors stored in Qdrant.")