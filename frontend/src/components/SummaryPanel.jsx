import ReactMarkdown from "react-markdown"

export default function SummaryPanel({ summary }) {
  return (
    <div className="card">
      <div className="panel-header">
        <span className="panel-icon">📝</span>
        <h2>Summary</h2>
      </div>
      <div className="summary-body">
        <ReactMarkdown>{summary}</ReactMarkdown>
      </div>
    </div>
  )
}
