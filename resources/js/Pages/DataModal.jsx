import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import Layout from "../Layouts/Layout";
import { Pencil, Trash2, Save, Upload, X, Download } from "lucide-react";

export default function DataModal() {
  const [file, setFile] = useState(null);
  const [tableName, setTableName] = useState("");
  const [message, setMessage] = useState({ text: "", type: "" });
  const [data, setData] = useState([]);
  const [form, setForm] = useState({});
  const [newRow, setNewRow] = useState({});
  const [sheetFilter, setSheetFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sheets, setSheets] = useState([]);
  const [loading, setLoading] = useState(false);

  const showMessage = (text, type = "success") => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: "", type: "" }), 3000);
  };

  const fetchSheets = useCallback(async () => {
    if (!tableName) return;
    setLoading(true);
    try {
      const res = await axios.get("http://127.0.0.1:8000/api/data-modal", {
        params: { table_name: tableName },
      });
      const uniqueSheets = [
        ...new Set(res.data.data.map((d) => d.source_sheet).filter(Boolean)),
      ];
      setSheets(uniqueSheets);
      if (uniqueSheets.length > 0) setSheetFilter(uniqueSheets[0]);
    } catch {
      showMessage("❌ Gagal mengambil daftar sheet", "error");
    } finally {
      setLoading(false);
    }
  }, [tableName]);

  const fetchData = useCallback(async () => {
    if (!tableName || !sheetFilter) return;
    setLoading(true);
    try {
      const res = await axios.get("http://127.0.0.1:8000/api/data-modal", {
        params: { table_name: tableName, sheet: sheetFilter, search: searchTerm },
      });
      setData(res.data.data || []);
    } catch {
      showMessage("❌ Gagal memuat data", "error");
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [tableName, sheetFilter, searchTerm]);

  useEffect(() => {
    const savedTable = localStorage.getItem("lastTableName");
    if (savedTable) setTableName(savedTable);
  }, []);

  useEffect(() => {
    if (tableName) {
      localStorage.setItem("lastTableName", tableName);
      fetchSheets();
    }
  }, [tableName, fetchSheets]);

  useEffect(() => {
    if (sheetFilter) fetchData();
  }, [sheetFilter, searchTerm, fetchData]);

  const handleUpload = async () => {
    if (!file) return showMessage("⚠️ Pilih file dulu!", "warning");
    if (!tableName) return showMessage("⚠️ Isi nama tabel dulu!", "warning");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("table_prefix", tableName);

    setLoading(true);
    try {
      const res = await axios.post(
        "http://127.0.0.1:8000/api/data-modal/import",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      showMessage("✅ " + res.data.message, "success");
      localStorage.setItem("lastTableName", tableName);
      await fetchSheets();
      await fetchData();
    } catch (err) {
      showMessage(
        "❌ Gagal upload: " +
          (err.response?.data?.message || "Server error"),
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAddInline = async () => {
    try {
      await axios.post("http://127.0.0.1:8000/api/data-modal/manual", {
        ...newRow,
        table_name: tableName,
      });
      setNewRow({});
      showMessage("✅ Data berhasil ditambahkan", "success");
      fetchData();
    } catch {
      showMessage("❌ Gagal tambah data inline", "error");
    }
  };

  const handleUpdate = async (id) => {
    try {
      await axios.put(`http://127.0.0.1:8000/api/data-modal/${id}`, {
        ...form,
        table_name: tableName,
      });
      setForm({});
      showMessage("✅ Data berhasil diperbarui", "success");
      fetchData();
    } catch {
      showMessage("❌ Gagal update data", "error");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Yakin hapus data ini?")) return;
    try {
      await axios.delete(`http://127.0.0.1:8000/api/data-modal/${id}`, {
        data: { table_name: tableName },
      });
      showMessage("✅ Data berhasil dihapus", "success");
      fetchData();
    } catch {
      showMessage("❌ Gagal hapus data", "error");
    }
  };

  const handleExport = async () => {
    if (!tableName) return showMessage("⚠️ Isi nama tabel dulu!", "warning");
    if (!sheetFilter) return showMessage("⚠️ Pilih sheet dulu!", "warning");

    try {
      const res = await axios.get(
        `http://127.0.0.1:8000/api/data-modal/export`,
        {
          params: { table_name: tableName, sheet: sheetFilter },
          responseType: "blob",
        }
      );

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${tableName}_${sheetFilter}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      showMessage("✅ Excel berhasil diunduh", "success");
    } catch (err) {
      showMessage("❌ Gagal export Excel", "error");
      console.error(err);
    }
  };

  const filteredData = data.filter((item) =>
    Object.values(item).some((val) =>
      val?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // 🔥 Hitung total deviden dari col_5
    // Hitung total deviden dari col_5
    const totalDeviden = filteredData.reduce((acc, row) => {
      // Pastikan col_5 berupa string lalu hapus semua koma/titik
      const clean = row.col_5?.toString().replace(/[.,]/g, "") || "0";
      const val = parseInt(clean, 10) || 0;
      return acc + val;
    }, 0);


  const renderTable = () => {
    if (loading)
      return (
        <div className="flex justify-center items-center min-h-[200px]">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-white"></div>
        </div>
      );

    if (!data.length)
      return (
        <p className="text-white italic text-center mt-5 text-lg">
          Tidak ada data tersedia
        </p>
      );

    const headers = Object.keys(data[0]).filter((h) => h !== "id");

    return (
      <div className="overflow-x-auto rounded-3xl p-4 bg-white shadow-2xl">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-2xl font-bold text-gray-900">Data Modal</h2>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl shadow-md transition"
          >
            <Download size={20} />
            Export Excel
          </button>
        </div>
        <table className="w-full border-collapse text-gray-800 text-lg">
          <thead></thead>
          <tbody className="divide-y divide-gray-200">
            {filteredData.map((row, idx) => (
              <tr
                key={row.id}
                className={`${
                  idx === 0
                    ? "bg-gradient-to-r from-[#5A0000] via-[#FF8C00] to-[#FFD700] text-white text-lg"
                    : "bg-white hover:bg-gray-50"
                } transition`}
              >
                {headers.map((h, i) => (
                  <td key={i} className="border px-4 py-3">
                    {form.id === row.id ? (
                      <input
                        type="text"
                        value={form[h] || ""}
                        onChange={(e) =>
                          setForm({ ...form, [h]: e.target.value })
                        }
                        className="border p-2 w-full rounded-md focus:ring-2 focus:ring-[#FF8C00] outline-none text-lg"
                      />
                    ) : (
                      row[h] ?? "-"
                    )}
                  </td>
                ))}
                <td className="border px-4 py-3 flex gap-2">
                  {form.id === row.id ? (
                    <>
                      <button
                        onClick={() => handleUpdate(row.id)}
                        className="text-green-600 hover:text-green-800 transition"
                      >
                        <Save size={22} />
                      </button>
                      <button
                        onClick={() => setForm({})}
                        className="text-gray-400 hover:text-gray-600 transition"
                      >
                        <X size={22} />
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setForm(row)}
                      className="text-blue-600 hover:text-blue-800 transition"
                    >
                      <Pencil size={22} />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(row.id)}
                    className="text-red-600 hover:text-red-800 transition"
                  >
                    <Trash2 size={22} />
                  </button>
                </td>
              </tr>
            ))}

            {/* Baris tambah data inline */}
            <tr className="bg-gray-50 hover:bg-yellow-100 transition">
              {headers.map((h, i) => (
                <td key={i} className="border px-4 py-3">
                  <input
                    type="text"
                    placeholder={h}
                    value={newRow[h] || ""}
                    onChange={(e) =>
                      setNewRow({ ...newRow, [h]: e.target.value })
                    }
                    className="border p-2 w-full rounded-md focus:ring-2 focus:ring-[#FF8C00] outline-none text-lg"
                  />
                </td>
              ))}
              <td className="border px-4 py-3">
                <button
                  onClick={handleAddInline}
                  className="bg-[#5A0000] hover:bg-[#FF8C00] text-white px-4 py-2 rounded-xl shadow-md transition"
                >
                  Tambah
                </button>
              </td>
            </tr>
          </tbody>
        </table>
               <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 text-center">
                <h3 className="text-2xl font-bold text-gray-800">💰 Total Deviden</h3>
                <p className="text-3xl font-extrabold text-green-600 mt-2">
                  Rp {totalDeviden.toLocaleString("id-ID")}
                </p>
              </div>
      </div>
    );
  };

  return (
    <Layout>
      <div className="p-8 min-h-screen bg-gradient-to-r from-[#5A0000] via-[#FF8C00] to-[#32CD32]">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-8 text-white text-center drop-shadow-md">
          📊 Upload & Kelola Data Modal
        </h1>

        {message.text && (
          <div
            className={`fixed top-5 right-5 z-50 px-6 py-4 rounded-xl shadow-xl transition font-semibold text-lg
            ${
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

        <div className="mb-8 flex flex-col md:flex-row items-center gap-4 md:gap-6">
          <input
            type="text"
            value={tableName}
            onChange={(e) => setTableName(e.target.value)}
            placeholder="Nama tabel (misal: data_modal)"
            className="border border-gray-300 p-3 rounded-lg flex-1 focus:ring-2 focus:ring-[#FF8C00] focus:outline-none bg-white text-gray-900 shadow-md text-lg"
          />
          <input
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={(e) => setFile(e.target.files[0])}
            className="text-gray-700 text-lg"
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

        {sheets.length > 0 && (
          <div className="mb-8 flex flex-col md:flex-row gap-4 items-center">
            <select
              value={sheetFilter}
              onChange={(e) => setSheetFilter(e.target.value)}
              className="border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-[#FF8C00] bg-white text-gray-900 shadow-md text-lg"
            >
              {sheets.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="🔍 Cari data..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border border-gray-300 p-3 rounded-lg flex-1 focus:ring-2 focus:ring-[#FF8C00] bg-white text-gray-900 shadow-md text-lg"
            />
          </div>
        )}

        {renderTable()}
      </div>
    </Layout>
  );
}
