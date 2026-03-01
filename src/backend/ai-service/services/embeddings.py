import os
from typing import List, Dict, Any
from langchain.embeddings import OpenAIEmbeddings
from langchain.text_splitter import RecursiveCharacterTextSplitter
from pinecone import Pinecone

class EmbeddingService:
    def __init__(self):
        self.embeddings = OpenAIEmbeddings(
            model="text-embedding-3-large",
            api_key=os.getenv("OPENAI_API_KEY")
        )
        self.chunker = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200,
            separators=["\n\n", "\n", " ", ""]
        )
        
        self.pinecone = Pinecone(
            api_key=os.getenv("PINECONE_API_KEY")
        )
        self.index_name = os.getenv("PINECONE_INDEX_NAME", "synapse-mind-concepts")
        
        try:
            self.index = self.pinecone.Index(self.index_name)
        except:
            self.index = None

    async def generate_embeddings(self, texts: List[str]) -> List[List[float]]:
        if not texts:
            return []
        
        return await self.embeddings.aembed_documents(texts)

    async def generate_query_embedding(self, query: str) -> List[float]:
        return await self.embeddings.aembed_query(query)

    async def semantic_search(
        self,
        query: str,
        user_id: str,
        top_k: int = 10
    ) -> List[Dict[str, Any]]:
        if not self.index:
            return []
        
        query_embedding = await self.generate_query_embedding(query)
        
        results = self.index.query(
            vector=query_embedding,
            filter={"user_id": {"$eq": user_id}},
            top_k=top_k,
            include_metadata=True
        )
        
        return [
            {
                "id": match.id,
                "score": match.score,
                "text": match.metadata.get("text", ""),
                "concept_name": match.metadata.get("concept_name", ""),
            }
            for match in results.matches
        ]

    async def store_embeddings(
        self,
        user_id: str,
        document_id: str,
        chunks: List[str],
        concept_names: List[str]
    ):
        if not self.index or not chunks:
            return
        
        embeddings = await self.generate_embeddings(chunks)
        
        vectors = []
        for i, (chunk, embedding) in enumerate(zip(chunks, embeddings)):
            concept_name = concept_names[i] if i < len(concept_names) else f"chunk_{i}"
            
            vectors.append({
                "id": f"{document_id}-{i}",
                "values": embedding,
                "metadata": {
                    "user_id": user_id,
                    "document_id": document_id,
                    "chunk_index": i,
                    "text": chunk[:500],
                    "concept_name": concept_name
                }
            })
        
        self.index.upsert(vectors)

    async def find_similar_concepts(
        self,
        concept_name: str,
        user_id: str,
        top_k: int = 5
    ) -> List[Dict[str, Any]]:
        return await self.semantic_search(
            query=concept_name,
            user_id=user_id,
            top_k=top_k
        )
