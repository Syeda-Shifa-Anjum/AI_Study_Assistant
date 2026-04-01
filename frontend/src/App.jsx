import { useState } from "react"
import UploadPanel from "./components/UploadPanel"
import SummaryPanel from "./components/SummaryPanel"
import QuizPanel from "./components/QuizPanel"
import ChatPanel from "./components/ChatPanel"
import "./App.css"

function App() {
  const [summary, setSummary] = useState("")
  const [loading, setLoading] = useState(false)
  const [docReady, setDocReady] = useState(false)
  const [activeTab, setActiveTab] = useState("summary")

  return (
    <div className="app">
      <header>
        <h1>📚 AI Study Assistant</h1>
        <p>Upload your notes or textbook and let AI help you study</p>
      </header>

      <UploadPanel
        setSummary={setSummary}
        setLoading={setLoading}
        setDocReady={setDocReady}
        loading={loading}
      />

      {docReady && (
        <div className="main-content">
          <div className="tabs">
            <button className={activeTab === "summary" ? "active" : ""} onClick={() => setActiveTab("summary")}>📝 Summary</button>
            <button className={activeTab === "quiz" ? "active" : ""} onClick={() => setActiveTab("quiz")}>🧠 Quiz</button>
            <button className={activeTab === "chat" ? "active" : ""} onClick={() => setActiveTab("chat")}>💬 Chat</button>
          </div>

          {activeTab === "summary" && <SummaryPanel summary={summary} />}
          {activeTab === "quiz" && <QuizPanel />}
          {activeTab === "chat" && <ChatPanel />}
        </div>
      )}
    </div>
  )
}

export default App