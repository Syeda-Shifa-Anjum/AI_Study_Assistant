# AI Study Assistant

A web app that lets users upload PDF study materials and get AI-powered summaries, quizzes, and a chat interface powered by Google Gemini.

## Architecture

- **Frontend**: React + Vite (port 5000 in dev, served by backend in production)
- **Backend**: FastAPI (Python) on port 8000 in dev, port 5000 in production

## Project Layout

```
frontend/         React + Vite app
  src/
    components/   UploadPanel, SummaryPanel, QuizPanel, ChatPanel
backend/
  main.py         FastAPI app with /upload, /quiz, /chat endpoints
  gemini_service.py  Google Gemini AI integration with local fallbacks
  venv/           Python virtual environment (uv-managed)
```

## Key Details

- Python dependencies are installed in `backend/venv/` using `uv`
- Frontend API calls use relative URLs; Vite proxies them to `localhost:8000` in dev
- In production, the built frontend is served directly by FastAPI from `frontend/dist/`
- Requires `GEMINI_API_KEY` secret — falls back to local text extraction if not set

## Running Locally

Two workflows:
1. **Backend API**: `cd backend && venv/bin/python -m uvicorn main:app --host localhost --port 8000`
2. **Start application**: `cd frontend && npm run dev` (port 5000)

## Deployment

- Build: `cd frontend && npm install && npm run build`
- Run: `cd backend && venv/bin/uvicorn main:app --host 0.0.0.0 --port 5000`
- Target: autoscale
