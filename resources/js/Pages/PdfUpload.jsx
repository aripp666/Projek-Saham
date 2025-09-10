import React, { useState } from "react";
import axios from "axios";

export default function PdfUpload() {
  const [file, setFile] = useState(null);
  const [lang, setLang] = useState("ind"); // default bahasa Indonesia
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");

  const handleUpload = async () => {
    if (!file) {
      alert("Pilih file PDF terlebih dahulu");
      return;
    }
    setLoading(true);
    setResult("");

    const formData = new FormData();
    formData.append("pdf", file);
    formData.append("lang", lang);

    try {
      const res = await axios.post("http://localhost:8000/api/pdf-upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResult(res.data.text);
    } catch (err) {
      console.error(err);
      setResult("Gagal memproses PDF");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Upload PDF & Extract Text</h2>

      <input type="file" accept="application/pdf" onChange={(e) => setFile(e.target.files[0])} />

      <select value={lang} onChange={(e) => setLang(e.target.value)} style={{ marginLeft: "10px" }}>
        <option value="ind">Bahasa Indonesia</option>
        <option value="eng">English</option>
      </select>

      <button onClick={handleUpload} disabled={loading} style={{ marginLeft: "10px" }}>
        {loading ? "Processing..." : "Upload"}
      </button>

      <div style={{ marginTop: "20px", whiteSpace: "pre-wrap" }}>
        <h3>Hasil Ekstrak:</h3>
        <p>{result}</p>
      </div>
    </div>
  );
}
