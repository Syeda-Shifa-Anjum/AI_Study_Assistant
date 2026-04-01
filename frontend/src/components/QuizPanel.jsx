import { useState } from "react"
import axios from "axios"
import ReactMarkdown from "react-markdown"

export default function QuizPanel() {
  const [quiz, setQuiz] = useState("")
  const [loading, setLoading] = useState(false)

  const fetchQuiz = async () => {
    setLoading(true)
    try {
      const res = await axios.post("/quiz")
      setQuiz(res.data.quiz)
    } catch {
      alert("Failed to generate quiz!")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card">
      <h2 style={{ marginBottom: "1rem", color: "#a78bfa" }}>🧠 Quiz</h2>
      {!quiz && (
        <button onClick={fetchQuiz} disabled={loading} style={{
          background: "#a78bfa", color: "#fff", border: "none",
          padding: "0.7rem 1.5rem", borderRadius: "8px", cursor: "pointer"
        }}>
          {loading ? "Generating..." : "Generate Quiz"}
        </button>
      )}
      {quiz && <ReactMarkdown>{quiz}</ReactMarkdown>}
    </div>
  )
}