import React, { useState, useEffect } from "react";
import axios from "axios";

axios.defaults.baseURL = "http://127.0.0.1:8000"; // lebih baik pindah ke file axios.js

export default function Data() {
  const [file, setFile] = useState(null);
  const [tableName, setTableName] = useState("");
  const [data, setData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tables, setTables] = useState([]);
  const [sheets, setSheets] = useState([]);
  const [sheetFilter, setSheetFilter] = useState("");

  // Ambil daftar tabel
  const fetchTables = async () => {
    try {
      const res = await axios.get("/api/list-tables");
      if (res.data.status === "success") {
        setTables(res.data.tables);
        if (res.data.tables.length > 0 && !tableName) {
          setTableName(res.data.tables[0]); // default tabel pertama
        }
      }
    } catch (error) {
      console.error("Fetch tables error:", error);
    }
  };

  // Ambil data dari tabel
  const fetchData = async () => {
    if (!tableName) return;
    setLoading(true);
    try {
      const res = await axios.get(`/api/get-dynamic-data/${tableName}`);
      if (res.data.status === "success") {
        let rows = res.data.data;

        // Ambil daftar sheet unik
        const uniqueSheets = [...new Set(rows.map((r) => r.sheet_name).filter(Boolean))];
        setSheets(uniqueSheets);

        // Filter berdasarkan sheet kalau dipilih
        if (sheetFilter) {
          rows = rows.filter((r) => r.sheet_name === sheetFilter);
        }

        setData(rows);
        setColumns(rows.length > 0 ? Object.keys(rows[0]) : []);
      } else {
        setData([]);
        setColumns([]);
        setSheets([]);
      }
    } catch (error) {
      console.error("Fetch data error:", error);
      setData([]);
      setColumns([]);
      setSheets([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTables();
  }, []);

  useEffect(() => {
    fetchData();
  }, [tableName, sheetFilter]);

  // Upload Excel
  const handleUpload = async () => {
    if (!file || !tableName) return alert("Pilih file & nama tabel!");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("table_name", tableName);

    try {
      const res = await axios.post("/api/import-dynamic", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res.data.status === "success") {
        alert(`${res.data.message}\nJumlah data: ${res.data.rows}`);
        setFile(null);
        setSheetFilter(""); // reset filter sheet
        fetchData();
        fetchTables();
      } else {
        alert(res.data.message || "Import gagal!");
      }
    } catch (error) {
      console.error("Import error:", error.response || error);
      alert(error.response?.data?.message || "Import gagal, cek console log!");
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Manajemen Data Excel</h1>

      {/* Pilihan tabel */}
      <div className="mb-4 flex gap-2">
        <select
          value={tableName}
          onChange={(e) => setTableName(e.target.value)}
          className="border px-2 py-1"
        >
          {tables.map((tbl) => (
            <option key={tbl} value={tbl}>
              {tbl}
            </option>
          ))}
        </select>
      </div>

      {/* Upload */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <input
          type="file"
          accept=".xlsx,.csv,.xls"
          onChange={(e) => setFile(e.target.files[0])}
          className="border px-2 py-1"
        />
        <button
          onClick={handleUpload}
          disabled={loading}
          className={`px-4 py-2 rounded text-white ${
            loading ? "bg-gray-400 cursor-not-allowed" : "bg-green-500 hover:bg-green-600"
          }`}
        >
          {loading ? "Mengimpor..." : "Import Excel"}
        </button>
      </div>

      {/* Filter Sheet (kalau ada multi-sheet) */}
      {sheets.length > 0 && (
        <div className="mb-4">
          <label className="mr-2">Filter Sheet:</label>
          <select
            value={sheetFilter}
            onChange={(e) => setSheetFilter(e.target.value)}
            className="border px-2 py-1"
          >
            <option value="">Semua</option>
            {sheets.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Tabel Data */}
      {loading ? (
        <p className="text-gray-500">Memuat data...</p>
      ) : data.length === 0 ? (
        <p className="text-gray-500">Tidak ada data di tabel {tableName}.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="table-auto border-collapse border border-gray-300 w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                {columns.map((col) => (
                  <th key={col} className="border px-2 py-1">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  {columns.map((col, i) => (
                    <td key={i} className="border px-2 py-1">
                      {row[col]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
