from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from backend.chat import get_chat_response

app = FastAPI(title="Budtender AI")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    reply: dict

@app.get("/")
def health():
    return {"status": "Budtender AI running 🌿"}

@app.post("/chat", response_model=ChatResponse)
def chat(req: ChatRequest):
    reply_data = get_chat_response(req.message)
    return {"reply": reply_data}