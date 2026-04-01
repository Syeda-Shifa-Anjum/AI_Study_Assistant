import { useState, useRef, useEffect } from "react"
import axios from "axios"
import ReactMarkdown from "react-markdown"

export default function ChatPanel() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, loading])

  const sendMessage = async () => {
    const question = input.trim()
    if (!question || loading) return
    const newMessages = [...messages, { role: "user", text: question }]
    setMessages(newMessages)
    setInput("")
    setLoading(true)

    try {
      const res = await axios.post("/chat", {
        question,
        history: messages.slice(-6)
      })
      setMessages(prev => [...prev, { role: "ai", text: res.data.answer }])
    } catch {
      setMessages(prev => [...prev, {
        role: "ai",
        text: "Something went wrong. Please try again."
      }])
    } finally {
      setLoading(false)
    }
  }

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="card">
      <div className="panel-header">
        <span className="panel-icon">💬</span>
        <h2>Chat with your document</h2>
      </div>

      <div className="chat-messages">
        {messages.length === 0 && (
          <div className="chat-empty">
            <span className="chat-empty-icon">🤖</span>
            <span>Ask anything about your document and I'll answer from the text.</span>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} className={`chat-bubble-row ${m.role}`}>
            <div className={`chat-avatar ${m.role}`}>
              {m.role === "ai" ? "🤖" : "🎓"}
            </div>
            <div className={`chat-bubble ${m.role}`}>
              {m.role === "ai"
                ? <ReactMarkdown>{m.text}</ReactMarkdown>
                : m.text
              }
            </div>
          </div>
        ))}

        {loading && (
          <div className="chat-bubble-row ai">
            <div className="chat-avatar ai">🤖</div>
            <div className="chat-bubble ai">
              <div className="typing-indicator">
                <span /><span /><span />
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <div className="chat-input-row">
        <input
          className="chat-input"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Ask a question about your document…"
          disabled={loading}
        />
        <button
          className="chat-send-btn"
          onClick={sendMessage}
          disabled={loading || !input.trim()}
          title="Send"
        >
          ➤
        </button>
      </div>
    </div>
  )
}
