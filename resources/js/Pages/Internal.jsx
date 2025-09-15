import React, { useEffect, useState } from "react";
import axios from "axios";
import Layout from "@/Layouts/Layout";
import { Link } from "@inertiajs/react";


export default function Internal() {
  const [pdfs, setPdfs] = useState([]);
  const [judul, setJudul] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPdf, setSelectedPdf] = useState(null); // untuk modal

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/internals");
      setPdfs(res.data);
    } catch (err) {
      console.error(err);
      setPdfs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return alert("Pilih file PDF terlebih dahulu!");

    const formData = new FormData();
    formData.append("judul", judul);
    formData.append("file", file);

    try {
      setLoading(true);
      await axios.post("/api/internals", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setJudul("");
      setFile(null);
      fetchData();
    } catch (err) {
      console.error(err);
      alert("Gagal upload PDF");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Yakin ingin menghapus PDF ini?")) return;
    try {
      setLoading(true);
      await axios.delete(`/api/internals/${id}`);
      fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-[#5A0000] via-[#FF8C00] to-[#FFD700]">
        <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-white shadow-lg"></div>
      </div>
    );

  return (
    <Layout>
      <div className="p-8 min-h-screen bg-gradient-to-br from-[#5A0000] via-[#FF8C00] to-[#32CD32] text-white">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-10 text-center tracking-wide drop-shadow-lg">
          📄 Ketentuan Internal
        </h1>

        {/* Upload Form */}
        <form
          onSubmit={handleUpload}
          className="bg-white/95 text-gray-900 rounded-3xl shadow-xl p-6 mb-10 max-w-xl mx-auto"
        >
          <h2 className="text-xl font-bold mb-4">Upload PDF Baru</h2>
          <input
            type="text"
            placeholder="Judul PDF"
            value={judul}
            onChange={(e) => setJudul(e.target.value)}
            className="w-full p-3 mb-4 rounded-lg border focus:ring-2 focus:ring-yellow-400"
            required
          />
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => setFile(e.target.files[0])}
            className="w-full p-3 mb-4 rounded-lg border"
            required
          />
          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-[#5A0000] via-[#FF8C00] to-[#FFD700] text-white font-bold rounded-lg shadow-lg hover:scale-105 transition"
          >
            Upload
          </button>
        </form>

        {/* PDF List */}
        {!pdfs.length ? (
          <p className="text-center text-white font-semibold">
            Belum ada PDF yang diupload.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {pdfs.map((pdf) => (
              <div
                key={pdf.id}
                className="bg-white/95 text-gray-900 rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition transform hover:-translate-y-1"
              >
               <div className="h-72 md:h-[500px] lg:h-[600px] overflow-hidden bg-gray-100 flex items-center justify-center">
  <iframe
    src={`/storage/${pdf.file}#toolbar=0&navpanes=0`}
    title={pdf.judul}
    className="w-full h-full"
  ></iframe>
</div>
 <div className="p-4 flex flex-col items-center">
                  <h2 className="text-lg font-bold mb-3 line-clamp-2 text-center">
                    {pdf.judul}
                  </h2>
                  <div className="flex gap-3">
                   <Link
                    href={`/internals/${pdf.id}`}
                    className="px-4 py-2 bg-gradient-to-r from-[#FF8C00] to-[#FFD700] rounded-lg text-white font-semibold shadow hover:scale-105 transition"
                    >
                    Lihat Selengkapnya
                    </Link>

                    <button
                      onClick={() => handleDelete(pdf.id)}
                      className="px-4 py-2 bg-red-600 rounded-lg text-white font-semibold shadow hover:scale-105 transition"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal PDF Viewer */}
        {selectedPdf && (
          <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50 p-4">
            <div className="bg-white w-full max-w-5xl rounded-xl overflow-hidden shadow-2xl relative">
              <button
                onClick={() => setSelectedPdf(null)}
                className="absolute top-3 right-3 bg-red-600 text-white rounded-full px-3 py-1 font-bold hover:bg-red-700 transition"
              >
                ✕
              </button>
              <iframe
                src={`/storage/${selectedPdf.file}#toolbar=1&navpanes=0`}
                title={selectedPdf.judul}
                className="w-full h-[80vh]"
              ></iframe>
              <div className="p-4 text-center font-semibold text-gray-800">
                {selectedPdf.judul}
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
