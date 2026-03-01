from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Any
import os
from dotenv import load_dotenv

from services.synapse import SynapseAI
from services.embeddings import EmbeddingService
from services.document_processor import DocumentProcessor

load_dotenv()

app = FastAPI(
    title="SynapseMind AI Service",
    description="AI Processing Service for SynapseMind",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

synapse_ai = SynapseAI()
embedding_service = EmbeddingService()
document_processor = DocumentProcessor()


class AskSynapseRequest(BaseModel):
    user_id: str
    message: str
    context: Optional[dict] = None


class ExplainConceptRequest(BaseModel):
    user_id: str
    concept_id: str
    concept_name: str
    definition: Optional[str] = None
    context: Optional[str] = None


class GenerateCardsRequest(BaseModel):
    user_id: str
    concept_id: str
    concept_name: str
    definition: Optional[str] = None
    count: int = 5
    learning_style: Optional[str] = "mixed"


class ProcessDocumentRequest(BaseModel):
    user_id: str
    content: str
    source: str
    source_url: Optional[str] = None


@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "ai-service"}


@app.post("/ai/ask-synapse")
async def ask_synapse(request: AskSynapseRequest):
    try:
        response = await synapse_ai.chat(
            user_id=request.user_id,
            message=request.message,
            context=request.context
        )
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/ai/explain-concept")
async def explain_concept(request: ExplainConceptRequest):
    try:
        response = await synapse_ai.explain_concept(
            concept_name=request.concept_name,
            definition=request.definition,
            context=request.context
        )
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/ai/generate-cards")
async def generate_review_cards(request: GenerateCardsRequest):
    try:
        cards = await synapse_ai.generate_review_cards(
            concept_name=request.concept_name,
            definition=request.definition,
            count=request.count,
            learning_style=request.learning_style
        )
        return {"cards": cards}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/ai/process-document")
async def process_document(request: ProcessDocumentRequest):
    try:
        result = await document_processor.process(
            content=request.content,
            source=request.source,
            user_id=request.user_id
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/embeddings/generate")
async def generate_embeddings(texts: List[str]):
    try:
        embeddings = await embedding_service.generate_embeddings(texts)
        return {"embeddings": embeddings}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/embeddings/search")
async def semantic_search(query: str, user_id: str, top_k: int = 10):
    try:
        results = await embedding_service.semantic_search(
            query=query,
            user_id=user_id,
            top_k=top_k
        )
        return {"results": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=3004)
