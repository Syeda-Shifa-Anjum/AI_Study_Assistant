import { useState } from "react"
import axios from "axios"

const LETTERS = ["A", "B", "C", "D", "E"]

export default function QuizPanel() {
  const [questions, setQuestions] = useState([])
  const [selected, setSelected] = useState({})
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const fetchQuiz = async () => {
    setLoading(true)
    setSelected({})
    setDone(false)
    try {
      const res = await axios.post("/quiz")
      setQuestions(res.data.quiz || [])
    } catch {
      alert("Failed to generate quiz. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleSelect = (qIdx, optIdx) => {
    if (selected[qIdx] !== undefined) return
    const updated = { ...selected, [qIdx]: optIdx }
    setSelected(updated)
    if (Object.keys(updated).length === questions.length) setDone(true)
  }

  const score = questions.filter((q, i) => selected[i] === q.answer).length

  const reset = () => {
    setSelected({})
    setDone(false)
    setQuestions([])
  }

  return (
    <div className="card">
      <div className="panel-header">
        <span className="panel-icon">🧠</span>
        <h2>Quiz</h2>
      </div>

      {questions.length === 0 && (
        <div style={{ textAlign: "center", padding: "1.5rem 0" }}>
          <p style={{ color: "#6b7280", fontSize: "0.9rem", marginBottom: "1.25rem" }}>
            Generate a personalised quiz based on your document.
          </p>
          <button className="btn-primary" onClick={fetchQuiz} disabled={loading}>
            {loading ? "⏳ Generating…" : "✨ Generate Quiz"}
          </button>
        </div>
      )}

      {questions.length > 0 && (
        <>
          {done && (
            <div className="quiz-score-banner">
              <div className="score-num">{score}/{questions.length}</div>
              <div className="score-label">
                {score === questions.length
                  ? "Perfect score! 🎉"
                  : score >= questions.length / 2
                  ? "Good effort — review the explanations below."
                  : "Keep studying — check the explanations to learn more."}
              </div>
            </div>
          )}

          {questions.map((q, qIdx) => {
            const picked = selected[qIdx]
            const answered = picked !== undefined

            return (
              <div key={qIdx} className="quiz-question-card">
                <div className="quiz-q-label">Question {qIdx + 1} of {questions.length}</div>
                <div className="quiz-question-text">{q.question}</div>
                <div className="quiz-options">
                  {q.options.map((opt, oIdx) => {
                    let cls = "quiz-option"
                    if (answered) {
                      if (oIdx === q.answer) cls += " reveal"
                      else if (oIdx === picked) cls += " wrong"
                    }
                    return (
                      <button
                        key={oIdx}
                        className={cls}
                        onClick={() => handleSelect(qIdx, oIdx)}
                        disabled={answered}
                      >
                        <span className="option-letter">{LETTERS[oIdx]}</span>
                        {opt}
                      </button>
                    )
                  })}
                </div>
                {answered && q.explanation && (
                  <div className="quiz-explanation">
                    💡 {q.explanation}
                  </div>
                )}
              </div>
            )
          })}

          <div style={{ textAlign: "center", marginTop: "0.5rem" }}>
            <button className="btn-primary" onClick={reset}>
              🔄 New Quiz
            </button>
          </div>
        </>
      )}
    </div>
  )
}
