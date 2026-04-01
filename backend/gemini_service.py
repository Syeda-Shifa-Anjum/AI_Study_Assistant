import os
import re
import json
from pathlib import Path
from dotenv import load_dotenv
from google import genai

BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env")
load_dotenv(BASE_DIR / "venv" / ".env")

_api_key = os.getenv("GEMINI_API_KEY")
client = genai.Client(api_key=_api_key) if _api_key else None


def _generate(prompt: str) -> str | None:
    if client is None:
        return None
    try:
        response = client.models.generate_content(
            model="gemini-2.0-flash", contents=prompt
        )
        return response.text or None
    except Exception:
        return None


# ─── Summary ──────────────────────────────────────────────────────────────────

def summarize_text(text: str) -> str:
    prompt = f"""You are an expert study assistant. Read the following document carefully and produce a structured summary.

Format your response in clean Markdown using these exact sections:

## Overview
A 2–3 sentence description of what the document is about and its purpose.

## Key Concepts
A bullet list of the 5–8 most important terms, ideas, or topics introduced. For each, give a one-sentence explanation.

## Main Points
A numbered list of the most important takeaways from the document. Be specific and use language from the source material.

## What to Remember
2–3 sentences highlighting the most critical things a student should memorise or understand deeply.

Rules:
- Be precise and factual — only include information from the document.
- Use clear, simple language a student can understand.
- Do NOT add generic advice like "study hard" or "review your notes".

Document:
{text[:12000]}"""

    result = _generate(prompt)
    if result:
        return result

    # Fallback
    sentences = [s.strip() for s in re.split(r"(?<=[.!?])\s+", " ".join(text.split())) if s.strip()][:6]
    lines = ["## Overview\n\n*(Gemini unavailable — showing extracted text)*\n\n## Main Points\n"]
    lines += [f"- {s}" for s in sentences]
    return "\n".join(lines)


# ─── Quiz ─────────────────────────────────────────────────────────────────────

def generate_quiz(text: str) -> list[dict]:
    prompt = f"""You are an expert educator. Read the document below and create an accurate 5-question multiple-choice quiz to test deep understanding.

Return ONLY a valid JSON array — no markdown, no explanation, no extra text.

Each item must follow this exact shape:
{{
  "question": "Clear, specific question based on the document",
  "options": ["Option A text", "Option B text", "Option C text", "Option D text"],
  "answer": 0,
  "explanation": "One sentence explaining why this answer is correct, referencing the document."
}}

Rules:
- "answer" is the 0-based index of the correct option in the "options" array.
- Questions must test understanding, not just memorisation of keywords.
- All wrong options must be plausible — avoid obviously silly distractors.
- Base every question strictly on the document content.
- Do NOT number the options (no "A)", "B)" prefixes) — just plain text.

Document:
{text[:12000]}"""

    raw = _generate(prompt)
    if raw:
        # Strip markdown fences if present
        cleaned = re.sub(r"```(?:json)?|```", "", raw).strip()
        try:
            data = json.loads(cleaned)
            if isinstance(data, list) and data:
                return data
        except (json.JSONDecodeError, ValueError):
            pass

    # Fallback static quiz
    return [
        {
            "question": "What is the best strategy for understanding a new document?",
            "options": ["Skim only the headings", "Read carefully and identify key ideas", "Memorise every word", "Skip unfamiliar sections"],
            "answer": 1,
            "explanation": "Reading carefully while identifying key ideas leads to genuine comprehension."
        },
        {
            "question": "Why is it helpful to summarise material in your own words?",
            "options": ["It makes notes longer", "It improves retention and reveals gaps in understanding", "It replaces the original document", "It is only useful for exams"],
            "answer": 1,
            "explanation": "Restating concepts in your own words reinforces memory and highlights what you don't yet understand."
        },
        {
            "question": "What should you do when you encounter an unclear section?",
            "options": ["Skip it permanently", "Re-read and look for context clues", "Delete your notes on it", "Assume it is unimportant"],
            "answer": 1,
            "explanation": "Re-reading with attention to surrounding context usually resolves confusion."
        },
        {
            "question": "What is a key benefit of self-testing after reading?",
            "options": ["It wastes time", "It shows you have finished studying", "It strengthens memory through active recall", "It replaces reading"],
            "answer": 2,
            "explanation": "Active recall — retrieving information from memory — is one of the most effective study techniques."
        },
        {
            "question": "Which approach leads to the deepest learning?",
            "options": ["Passive re-reading", "Highlighting everything", "Connecting new ideas to what you already know", "Studying only the night before"],
            "answer": 2,
            "explanation": "Linking new information to prior knowledge builds stronger, more lasting understanding."
        }
    ]


# ─── Chat ─────────────────────────────────────────────────────────────────────

def chat_with_doc(text: str, question: str, history: list[dict] | None = None) -> str:
    history_block = ""
    if history:
        lines = []
        for msg in history[-6:]:
            role = "Student" if msg["role"] == "user" else "Assistant"
            lines.append(f"{role}: {msg['text']}")
        history_block = "\nConversation so far:\n" + "\n".join(lines) + "\n"

    prompt = f"""You are a precise and helpful study assistant. Your job is to answer questions based ONLY on the document provided.

Document:
{text[:12000]}
{history_block}
Student's question: {question}

Instructions:
- Answer directly and clearly using information from the document.
- If the answer is in the document, quote or paraphrase the relevant part.
- If the question cannot be answered from the document, say exactly: "I couldn't find that in the document. Try rephrasing or ask about a specific topic covered in the text."
- Do NOT invent or assume information not in the document.
- Keep your answer concise but complete — aim for 2–5 sentences unless more detail is needed.
- Use plain language a student can understand."""

    result = _generate(prompt)
    if result:
        return result

    # Fallback keyword search
    words = [w for w in re.findall(r"[a-zA-Z]{4,}", question.lower())]
    lower = text.lower()
    for word in words:
        idx = lower.find(word)
        if idx != -1:
            start = max(0, idx - 150)
            end = min(len(text), idx + 300)
            excerpt = " ".join(text[start:end].split())
            return f"*(Gemini unavailable)* I found a relevant passage:\n\n\"{excerpt}\""
    return "*(Gemini unavailable)* I couldn't find a clear match for your question. Try using specific keywords from the document."
