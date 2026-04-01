import ReactMarkdown from "react-markdown"

export default function SummaryPanel({ summary }) {
  return (
    <div className="card">
      <h2 style={{ marginBottom: "1rem", color: "#a78bfa" }}>📝 Summary</h2>
      <div style={{ lineHeight: 1.8 }}>
        <ReactMarkdown>{summary}</ReactMarkdown>
      </div>
    </div>
  )
}