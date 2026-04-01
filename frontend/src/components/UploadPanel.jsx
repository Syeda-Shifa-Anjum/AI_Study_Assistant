import { useState } from "react"
import axios from "axios"

export default function UploadPanel({ setSummary, setLoading, setDocReady, loading }) {
  const [fileName, setFileName] = useState("")

  const handleUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setFileName(file.name)
    setLoading(true)

    const formData = new FormData()
    formData.append("file", file)

    try {
      const res = await axios.post("/upload", formData)
      setSummary(res.data.summary)
      setDocReady(true)
    } catch (err) {
      const detail = err?.response?.data?.detail
      alert(detail || "Upload failed. Make sure the backend is running!")
    } finally {
      setLoading(false)
    }
  }

  return (
    <label style={{ cursor: loading ? "not-allowed" : "pointer" }}>
      <div className={`upload-zone${loading ? " loading" : ""}`}>
        <div className="upload-zone-icon">
          {loading ? "⏳" : fileName ? "✅" : "📂"}
        </div>
        <div className="upload-zone-text">
          {loading
            ? <><strong>Analysing your document…</strong></>
            : fileName
            ? <><strong>{fileName}</strong> — click to upload a different file</>
            : <><strong>Click to upload a PDF</strong> — your notes, textbook or any document</>
          }
        </div>
      </div>
      <input
        type="file"
        accept=".pdf"
        onChange={handleUpload}
        style={{ display: "none" }}
        disabled={loading}
      />
    </label>
  )
}
