from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import fitz  # PyMuPDF
from gemini_service import summarize_text, generate_quiz, chat_with_doc

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Store extracted text in memory (simple approach for now)
doc_store = {"text": ""}

def extract_text_from_pdf(file_bytes: bytes) -> str:
    doc = fitz.open(stream=file_bytes, filetype="pdf")
    return "\n".join(page.get_text() for page in doc)

@app.post("/upload")
async def upload_pdf(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        text = extract_text_from_pdf(contents)
        if not text.strip():
            raise HTTPException(status_code=400, detail="No readable text found in the PDF")
        doc_store["text"] = text
        summary = summarize_text(text)
        return {"summary": summary}
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc

@app.post("/quiz")
async def get_quiz():
    if not doc_store["text"]:
        raise HTTPException(status_code=400, detail="No document uploaded yet")
    try:
        quiz = generate_quiz(doc_store["text"])
        return {"quiz": quiz}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc

class ChatRequest(BaseModel):
    question: str

@app.post("/chat")
async def chat(req: ChatRequest):
    if not doc_store["text"]:
        raise HTTPException(status_code=400, detail="No document uploaded yet")
    try:
        answer = chat_with_doc(doc_store["text"], req.question)
        return {"answer": answer}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc