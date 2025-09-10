import React, { useState, useEffect } from "react";
import axios from "axios";
import Layout from "../Layouts/Layout";
import { Trash2, Edit, Plus, Save, X } from "lucide-react";

export default function Perda() {
  const [file, setFile] = useState(null);
  const [judul, setJudul] = useState("");
  const [data, setData] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingRow, setEditingRow] = useState([]);
  const itemsPerPage = 10;
  const filters = ["provinsi", "kabupaten", "kota", "all"];

  // Ambil data terakhir dari backend
  useEffect(() => {
    const fetchLastImport = async () => {
      try {
        setLoading(true);
        const res = await axios.get("http://localhost:8000/api/perda/last-import");
        if (res.data.success) {
          setJudul(res.data.judul);
          setData(res.data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchLastImport();
  }, []);

  // Upload Excel
  const handleUpload = async () => {
    if (!file) return alert("⚠ Pilih file terlebih dahulu!");
    const formData = new FormData();
    formData.append("file", file);
    try {
      setLoading(true);
      const res = await axios.post("http://localhost:8000/api/perda/import", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res.data.success) {
        setJudul(res.data.judul);
        setData(res.data.data);
        setFile(null);
      }
    } catch (err) {
      console.error(err);
      alert("❌ Gagal upload file!");
    } finally {
      setLoading(false);
    }
  };

  // Export Excel
  const handleExport = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:8000/api/perda/export", {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "perda.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error(err);
      alert("❌ Gagal export Excel");
    } finally {
      setLoading(false);
    }
  };

  // Tambah row baru
  const addRowBelow = (index) => {
    const emptyRow = Array(data[0]?.length || 9).fill("");
    const newData = [...data];
    newData.splice(index + 1, 0, emptyRow);
    setData(newData);
  };

  // Hapus row
  const deleteRow = async (index) => {
    if (!confirm("Yakin hapus row ini?")) return;
    try {
      setLoading(true);
      const res = await axios.delete(`http://localhost:8000/api/perda/row/${index}`);
      setData(res.data.data);
    } catch (err) {
      console.error(err);
      alert("❌ Gagal hapus row");
    } finally {
      setLoading(false);
    }
  };

  // Edit row
  const startEditRow = (index) => {
    setEditingIndex(index);
    setEditingRow([...data[index]]);
  };

  const cancelEdit = () => {
    setEditingIndex(null);
    setEditingRow([]);
  };

  const updateCell = (cellIndex, value) => {
    const newRow = [...editingRow];
    newRow[cellIndex] = value;
    setEditingRow(newRow);
  };

  const saveRow = async (index) => {
    try {
      setLoading(true);
      const res = await axios.put(`http://localhost:8000/api/perda/row/${index}`, {
        row: editingRow,
      });
      if (res.data.success) {
        setData(res.data.data);
        setEditingIndex(null);
        setEditingRow([]);
      }
    } catch (err) {
      console.error(err);
      alert("❌ Gagal update row");
    } finally {
      setLoading(false);
    }
  };

  // Filter + search
  const filteredData = data.filter((row) => {
    if (filter === "all") return true;
    const wilayah = String(row[1] || "").toLowerCase();
    if (filter === "provinsi") return wilayah.includes("provinsi");
    if (filter === "kabupaten") return wilayah.includes("kabupaten");
    if (filter === "kota") return wilayah.includes("kota");
    return true;
  });

  const searchedData = filteredData.filter((row) =>
    row.some((cell) => String(cell).toLowerCase().includes(search.toLowerCase()))
  );

  // Pagination
  const totalPages = Math.ceil(searchedData.length / itemsPerPage);
  const paginatedData = searchedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-[#5A0000] via-[#FF8C00] to-[#FFD700]">
        <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-white shadow-lg"></div>
      </div>
    );

  return (
    <Layout>
      <div className="p-10 min-h-screen bg-gradient-to-br from-[#5A0000] via-[#FF8C00] to-[#32CD32]">
        <div className="max-w-[95%] mx-auto">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-8 text-white text-center drop-shadow-lg">
            📑 Upload & Kelola Data PERDA
          </h1>

          {/* Upload + Filter/Search + Export */}
          <div className="mb-8 flex flex-col md:flex-row items-center gap-6">
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={(e) => setFile(e.target.files[0])}
              className="text-white text-lg"
            />
            <button
              onClick={handleUpload}
              disabled={loading}
              className="flex items-center gap-3 bg-gradient-to-r from-[#5A0000] via-[#FF8C00] to-[#FFD700] text-white px-6 py-3 rounded-xl shadow-lg hover:scale-105 transition disabled:opacity-50 text-lg"
            >
              Upload
            </button>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-xl shadow-lg hover:scale-105 transition text-lg"
            >
              Export Excel
            </button>
          </div>

          {/* Filter + Search */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
            <div className="flex flex-wrap gap-3">
              {filters.map((item) => (
                <button
                  key={item}
                  onClick={() => {
                    setFilter(item);
                    setCurrentPage(1);
                  }}
                  className={`px-5 py-2 rounded-xl font-semibold shadow-md transition ${
                    filter === item
                      ? "bg-green-600 text-white scale-105"
                      : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                  }`}
                >
                  {item === "all" ? "Semua" : item.charAt(0).toUpperCase() + item.slice(1)}
                </button>
              ))}
            </div>

            <input
              type="text"
              placeholder="🔍 Cari data..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2 rounded-xl border shadow w-72 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all"
            />
          </div>

          {/* Table */}
          <div className="overflow-x-auto shadow-2xl rounded-3xl p-6 bg-white">
            {paginatedData.length === 0 ? (
              <p className="text-gray-600 italic text-center py-10 text-lg">
                Tidak ada data tersedia
              </p>
            ) : (
              <table className="w-full border-collapse text-gray-800 text-base">
                <thead>
                  <tr className="bg-gradient-to-r from-[#5A0000] via-[#FF8C00] to-[#FFD700] text-white sticky top-0">
                    <th className="border px-6 py-4">NO</th>
                    <th className="border px-6 py-4">PROVINSI/KAB/KOTA</th>
                    <th className="border px-6 py-4">NO PERDA</th>
                    <th className="border px-6 py-4">TAHUN</th>
                    <th className="border px-6 py-4">MEKANISME SETORAN MODAL</th>
                    <th className="border px-6 py-4">ASET</th>
                    <th className="border px-6 py-4">NILAI ASET</th>
                    <th className="border px-6 py-4">TUNAI</th>
                    <th className="border px-6 py-4">KETERANGAN</th>
                    <th className="border px-6 py-4">AKSI</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {paginatedData.map((row, i) => {
                    const realIndex = (currentPage - 1) * itemsPerPage + i;
                    const rowWithoutExcelNo = row.length > 1 ? row.slice(1) : row;
                    const isEditing = editingIndex === realIndex;
                    return (
                      <tr
                        key={i}
                        className={`${i % 2 === 0 ? "bg-gray-50" : "bg-white"} hover:bg-yellow-50 transition`}
                      >
                        <td className="border px-6 py-4">{realIndex + 1}</td>
                        {rowWithoutExcelNo.map((cell, j) => (
                          <td key={j} className="border px-6 py-4">
                            {isEditing ? (
                              <input
                                type="text"
                                value={editingRow[j]}
                                onChange={(e) => updateCell(j, e.target.value)}
                                className="border px-1 py-0 w-full"
                              />
                            ) : (
                              cell
                            )}
                          </td>
                        ))}
                        <td className="border px-6 py-4 flex gap-1">
                          {isEditing ? (
                            <>
                              <button onClick={() => saveRow(realIndex)} className="p-1 bg-green-500 text-white rounded hover:bg-green-600">
                                <Save size={16} />
                              </button>
                              <button onClick={cancelEdit} className="p-1 bg-gray-400 text-white rounded hover:bg-gray-500">
                                <X size={16} />
                              </button>
                            </>
                          ) : (
                            <>
                              <button onClick={() => addRowBelow(realIndex)} className="p-1 bg-blue-500 text-white rounded hover:bg-blue-600">
                                <Plus size={16} />
                              </button>
                              <button onClick={() => deleteRow(realIndex)} className="p-1 bg-red-500 text-white rounded hover:bg-red-600">
                                <Trash2 size={16} />
                              </button>
                              <button onClick={() => startEditRow(realIndex)} className="p-1 bg-yellow-500 text-white rounded hover:bg-yellow-600">
                                <Edit size={16} />
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center mt-6 gap-2 flex-wrap">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => prev - 1)}
                className="px-3 py-1 rounded bg-gray-300 hover:bg-gray-400 disabled:opacity-50"
              >
                Prev
              </button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-3 py-1 rounded ${
                    currentPage === i + 1 ? "bg-green-600 text-white" : "bg-gray-200 hover:bg-gray-300"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((prev) => prev + 1)}
                className="px-3 py-1 rounded bg-gray-300 hover:bg-gray-400 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
