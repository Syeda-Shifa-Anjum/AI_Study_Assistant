import { useState } from "react"
import axios from "axios"

export default function ChatPanel() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)

  const sendMessage = async () => {
    if (!input.trim()) return
    const question = input
    setMessages(prev => [...prev, { role: "user", text: question }])
    setInput("")
    setLoading(true)

    try {
      const res = await axios.post("http://127.0.0.1:8000/chat", { question })
      setMessages(prev => [...prev, { role: "ai", text: res.data.answer }])
    } catch {
      alert("Chat failed!")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card">
      <h2 style={{ marginBottom: "1rem", color: "#a78bfa" }}>💬 Chat with your doc</h2>
      <div style={{ minHeight: "200px", marginBottom: "1rem" }}>
        {messages.map((m, i) => (
          <div key={i} style={{
            textAlign: m.role === "user" ? "right" : "left",
            margin: "0.5rem 0"
          }}>
            <span style={{
              background: m.role === "user" ? "#a78bfa" : "#2e2e3e",
              padding: "0.5rem 1rem", borderRadius: "12px",
              display: "inline-block", maxWidth: "80%"
            }}>
              {m.text}
            </span>
          </div>
        ))}
        {loading && <p style={{ color: "#888" }}>AI is thinking...</p>}
      </div>
      <div style={{ display: "flex", gap: "0.5rem" }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && sendMessage()}
          placeholder="Ask something about your document..."
          style={{
            flex: 1, padding: "0.7rem", borderRadius: "8px",
            border: "1px solid #444", background: "#0f0f1a", color: "#fff"
          }}
        />
        <button onClick={sendMessage} style={{
          background: "#a78bfa", color: "#fff", border: "none",
          padding: "0.7rem 1.2rem", borderRadius: "8px", cursor: "pointer"
        }}>Send</button>
      </div>
    </div>
  )
}