import os
import re
from pathlib import Path
from dotenv import load_dotenv
from google import genai

# Load .env from backend root, then fallback to backend/venv/.env.
BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env")
load_dotenv(BASE_DIR / "venv" / ".env")

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))


def _first_sentences(text: str, count: int = 5) -> list[str]:
    cleaned = " ".join(text.split())
    parts = re.split(r"(?<=[.!?])\s+", cleaned)
    return [p.strip() for p in parts if p.strip()][:count]


def _local_summary(text: str) -> str:
    sentences = _first_sentences(text, 5)
    if not sentences:
        return "Fallback summary: The document appears to have little or no readable text."
    lines = ["Fallback summary (Gemini quota exceeded):"]
    lines.extend(f"- {sentence}" for sentence in sentences)
    return "\n".join(lines)


def _local_quiz(text: str) -> str:
    snippets = _first_sentences(text, 3)
    context = snippets[0] if snippets else "the uploaded material"
    return (
        "Fallback quiz (Gemini quota exceeded):\n\n"
        "Q1: Which sentence best reflects the main topic of the document?\n"
        f"A) {context}\nB) An unrelated topic\nC) A random fact\nD) None of these\n"
        "Answer: A\n\n"
        "Q2: What is the best study strategy for this material?\n"
        "A) Ignore key terms\nB) Summarize each section in your own words\n"
        "C) Memorize without understanding\nD) Skip difficult parts\n"
        "Answer: B\n\n"
        "Q3: Why should you identify key points while reading?\n"
        "A) To improve recall\nB) To make notes longer\nC) To avoid revision\nD) To finish faster only\n"
        "Answer: A\n\n"
        "Q4: What should you do if a section is unclear?\n"
        "A) Skip it forever\nB) Re-read and ask targeted questions\n"
        "C) Delete your notes\nD) Stop studying\n"
        "Answer: B\n\n"
        "Q5: What is a good next step after finishing the document?\n"
        "A) Self-test with questions\nB) Never review again\n"
        "C) Share without checking\nD) Start a new topic immediately\n"
        "Answer: A"
    )


def _local_chat(text: str, question: str) -> str:
    question_words = [w for w in re.findall(r"[a-zA-Z]{3,}", question.lower()) if len(w) > 3]
    lower_text = text.lower()
    for word in question_words:
        idx = lower_text.find(word)
        if idx != -1:
            start = max(0, idx - 120)
            end = min(len(text), idx + 220)
            excerpt = " ".join(text[start:end].split())
            return (
                "Fallback answer (Gemini quota exceeded): I found a relevant passage in your document:\n\n"
                f"\"{excerpt}\""
            )
    return (
        "Fallback answer (Gemini quota exceeded): I could not confidently find this in the document text. "
        "Try asking with specific keywords that appear in your notes."
    )


def _generate_with_fallback(prompt: str, fallback_text: str) -> str:
    try:
        response = client.models.generate_content(
            model="gemini-2.0-flash", contents=prompt
        )
        return response.text or fallback_text
    except Exception:
        return fallback_text

def summarize_text(text: str) -> str:
    prompt = f"""You are a study assistant. Summarize the following study material 
    in a clear, concise way with key points highlighted.\n\n{text}"""
    return _generate_with_fallback(prompt, _local_summary(text))

def generate_quiz(text: str) -> str:
    prompt = f"""Based on the following study material, generate 5 multiple choice 
    questions to test understanding. Format each question as:
    
    Q1: [question]
    A) ...  B) ...  C) ...  D) ...
    Answer: [correct letter]
    
    Material:\n\n{text}"""
    return _generate_with_fallback(prompt, _local_quiz(text))

def chat_with_doc(text: str, question: str) -> str:
    prompt = f"""You are a helpful study assistant. Use ONLY the following document 
    to answer the user's question. If the answer isn't in the document, say so.
    
    Document:\n{text}\n\nQuestion: {question}"""
    return _generate_with_fallback(prompt, _local_chat(text, question))
