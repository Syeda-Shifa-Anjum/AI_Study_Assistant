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
      const res = await axios.post("http://127.0.0.1:8000/upload", formData)
      setSummary(res.data.summary)
      setDocReady(true)
    } catch (err) {
      const detail = err?.response?.data?.detail
      const message = detail || "Upload failed. Make sure the backend is running!"
      alert(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card" style={{ marginBottom: "1.5rem", textAlign: "center" }}>
      <label style={{ cursor: "pointer" }}>
        <div style={{
          border: "2px dashed #a78bfa", borderRadius: "10px",
          padding: "2rem", marginBottom: "1rem"
        }}>
          {loading ? "⏳ Analysing your document..." : fileName
            ? `✅ ${fileName}` : "📂 Click to upload a PDF"}
        </div>
        <input type="file" accept=".pdf" onChange={handleUpload}
          style={{ display: "none" }} disabled={loading} />
      </label>
    </div>
  )
}