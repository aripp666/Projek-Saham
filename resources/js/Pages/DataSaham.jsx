import React, { useState, useEffect } from "react";
import axios from "axios";
import { Pencil, Trash2, Save, Upload, X } from "lucide-react";
import Layout from "@/Layouts/Layout";

export default function DataSaham() {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [data, setData] = useState([]);
  const [form, setForm] = useState({});
  const [newRow, setNewRow] = useState({});
  const [loading, setLoading] = useState(false);

  const tableName = "data_saham";

  const showMessage = (text, type = "success") => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: "", type: "" }), 3000);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/data-saham?table_name=${tableName}`);
      setData(res.data);
    } catch {
      showMessage("❌ Gagal memuat data", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpload = async () => {
    if (!file) return showMessage("⚠️ Pilih file dulu!", "warning");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("table_name", tableName);

    setLoading(true);
    try {
      const res = await axios.post("/api/data-saham/import", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      showMessage("✅ " + res.data.message, "success");
      fetchData();
    } catch {
      showMessage("❌ Gagal upload file", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    try {
      await axios.post("/api/data-saham", { ...newRow, table_name: tableName });
      setNewRow({});
      fetchData();
      showMessage("✅ Data berhasil ditambahkan", "success");
    } catch {
      showMessage("❌ Gagal tambah data", "error");
    }
  };

  const handleUpdate = async (id) => {
    try {
      await axios.put(`/api/data-saham/${id}`, { ...form, table_name: tableName });
      setForm({});
      fetchData();
      showMessage("✅ Data berhasil diperbarui", "success");
    } catch {
      showMessage("❌ Gagal update data", "error");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Yakin hapus data ini?")) return;
    try {
      await axios.delete(`/api/data-saham/${id}`, { data: { table_name: tableName } });
      fetchData();
      showMessage("✅ Data berhasil dihapus", "success");
    } catch {
      showMessage("❌ Gagal hapus data", "error");
    }
  };

  const cleanNumber = (val) => parseFloat(val?.toString().replace(/[^0-9.-]/g, "")) || 0;
  const totalModal = data.reduce((sum, row) => sum + cleanNumber(row.jumlah_modal_rp), 0);
  const getPercentage = (value) => (totalModal === 0 ? 0 : ((cleanNumber(value) / totalModal) * 100).toFixed(2));
  const totalPersentase = data.reduce(
    (sum, row) => sum + parseFloat(getPercentage(row.jumlah_modal_rp)),
    0
  );

  const renderTable = () => {
    if (loading)
      return (
        <div className="flex justify-center items-center min-h-[200px]">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-white"></div>
        </div>
      );

    if (!data.length)
      return <p className="text-white italic text-center mt-5 text-lg">Tidak ada data tersedia</p>;

    return (
      <div className="overflow-x-auto shadow-2xl rounded-3xl p-6 bg-white">
        <button
  onClick={() => window.open(`/api/data-saham/export?table_name=${tableName}`, "_blank")}
  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl shadow-lg transition text-lg mb-6"
>
  📥 Export Excel
</button>

        <table className="w-full border-collapse text-gray-800 text-xl">
          <thead>
            <tr className="bg-[#5A0000] text-white sticky top-0">
              <th className="border px-4 py-3 text-left">ID</th>
              <th className="border px-4 py-3 text-left">Nama Pemegang Saham</th>
              <th className="border px-4 py-3 text-left">Jumlah Modal</th>
              <th className="border px-4 py-3 text-left">Komposisi (%)</th>
              <th className="border px-4 py-3 text-left">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.map((row, idx) => (
              <tr
                key={row.id}
                className={`${idx % 2 === 0 ? "bg-gray-50" : "bg-white"}`}
              >
                <td className="border px-4 py-3">{row.id}</td>
                <td className="border px-4 py-3">
                  {form.id === row.id ? (
                    <input
                      type="text"
                      value={form.nama_pemegang_saham || ""}
                      onChange={(e) => setForm({ ...form, nama_pemegang_saham: e.target.value })}
                      className="border p-2 w-full rounded-md focus:ring-2 focus:ring-[#FF8C00] outline-none text-lg"
                    />
                  ) : (
                    row.nama_pemegang_saham
                  )}
                </td>
                <td className="border px-4 py-3">
                  {form.id === row.id ? (
                    <input
                      type="text"
                      value={form.jumlah_modal_rp || ""}
                      onChange={(e) => setForm({ ...form, jumlah_modal_rp: e.target.value })}
                      className="border p-2 w-full rounded-md focus:ring-2 focus:ring-[#FF8C00] outline-none text-lg"
                    />
                  ) : (
                    row.jumlah_modal_rp
                  )}
                </td>
                <td className="border px-4 py-3">{getPercentage(row.jumlah_modal_rp)}%</td>
                <td className="border px-4 py-3 flex gap-3">
                  {form.id === row.id ? (
                    <>
                      <button onClick={() => handleUpdate(row.id)} className="text-green-600 hover:text-green-800 transition">
                        <Save size={22} />
                      </button>
                      <button onClick={() => setForm({})} className="text-gray-400 hover:text-gray-600 transition">
                        <X size={22} />
                      </button>
                    </>
                  ) : (
                    <button onClick={() => setForm(row)} className="text-blue-600 hover:text-blue-800 transition">
                      <Pencil size={22} />
                    </button>
                  )}
                  <button onClick={() => handleDelete(row.id)} className="text-red-600 hover:text-red-800 transition">
                    <Trash2 size={22} />
                  </button>
                </td>
              </tr>
            ))}

            {/* Inline Add */}
            <tr className="bg-white hover:bg-yellow-100 transition">
              <td className="border px-4 py-3">#</td>
              <td className="border px-4 py-3">
                <input
                  type="text"
                  placeholder="Nama Pemegang Saham"
                  value={newRow.nama_pemegang_saham || ""}
                  onChange={(e) => setNewRow({ ...newRow, nama_pemegang_saham: e.target.value })}
                  className="border p-2 w-full rounded-md focus:ring-2 focus:ring-[#FF8C00] outline-none text-lg"
                />
              </td>
              <td className="border px-4 py-3">
                <input
                  type="text"
                  placeholder="Jumlah Modal"
                  value={newRow.jumlah_modal_rp || ""}
                  onChange={(e) => setNewRow({ ...newRow, jumlah_modal_rp: e.target.value })}
                  className="border p-2 w-full rounded-md focus:ring-2 focus:ring-[#FF8C00] outline-none text-lg"
                />
              </td>
              <td className="border px-4 py-3">-</td>
              <td className="border px-4 py-3">
                <button
                  onClick={handleAdd}
                  className="bg-[#5A0000] hover:bg-[#FF8C00] text-white px-5 py-2 rounded-xl shadow-lg transition text-lg"
                >
                  Tambah
                </button>
              </td>
            </tr>

            {/* Total */}
            <tr className="bg-yellow-200 font-bold">
              <td className="border px-4 py-3 text-center" colSpan={2}>
                TOTAL KESELURUHAN
              </td>
              <td className="border px-4 py-3">{totalModal.toLocaleString("id-ID")}</td>
              <td className="border px-4 py-3"></td>
              <td className="border px-4 py-3"></td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <Layout>
      <div className="p-8 min-h-screen bg-gradient-to-r from-[#5A0000] via-[#FF8C00] to-[#32CD32]">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-8 text-white text-center drop-shadow-md">
          📊 Upload & Kelola Data Saham
        </h1>

        {/* Notifikasi */}
        {message.text && (
          <div
            className={`fixed top-5 right-5 z-50 px-6 py-4 rounded-xl shadow-xl transition font-semibold text-lg ${
              message.type === "success"
                ? "bg-green-600 text-white"
                : message.type === "error"
                ? "bg-red-600 text-white"
                : "bg-yellow-500 text-white"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Upload File */}
        <div className="mb-8 flex flex-col md:flex-row items-center gap-6">
          <input
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={(e) => setFile(e.target.files[0])}
            className="text-white text-lg"
          />
          <button
            onClick={handleUpload}
            disabled={loading}
            className="flex items-center gap-3 bg-[#5A0000] hover:bg-[#FF8C00] text-white px-6 py-3 rounded-xl shadow-lg hover:scale-105 transition disabled:opacity-50 text-lg"
          >
            <Upload size={20} />
            {loading ? "⏳ Uploading..." : "Upload"}
          </button>
        </div>

        {/* Table */}
        {renderTable()}
      </div>
    </Layout>
  );
}
