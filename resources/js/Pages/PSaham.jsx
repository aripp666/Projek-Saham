import React, { useEffect, useState } from "react";
import axios from "axios";
import Layout from "../Layouts/Layout";
import { Link } from "@inertiajs/react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const PSaham = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState("nama");
  const [sortOrder, setSortOrder] = useState("asc");
  const [chartData, setChartData] = useState([]);
  const [pieData, setPieData] = useState([]);

  const fetchData = async () => {
    try {
      const res = await axios.get("/api/data-saham", { params: { table_name: "data_saham" } });

      const formattedData = res.data.map((item, index) => ({
        id: item.id ?? index,
        no: item.no ?? null,
        nama_pemegang_saham: item.nama_pemegang_saham ?? item["NAMA PEMEGANG SAHAM"] ?? "Unknown",
        jumlah_modal_rp: item.jumlah_modal_rp ?? item["JUMLAH MODAL RP"] ?? 0,
        komposisi_saham: item.komposisi_saham ?? item["KOMPOSISI SAHAM"] ?? "0%",
      }));

      setData(formattedData);

      setChartData(formattedData.map(d => ({
        name: d.nama_pemegang_saham,
        modal: Number(d.jumlah_modal_rp.toString().replace(/[^0-9]/g, "")),
      })));

      setPieData(formattedData.map(d => ({
        name: d.nama_pemegang_saham,
        value: parseFloat(d.komposisi_saham.toString().replace("%", "") || 0),
      })));
    } catch (err) {
      console.error(err);
      setData([]);
      setChartData([]);
      setPieData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const totalPersentase = pieData.reduce((sum, d) => sum + d.value, 0);
  const COLORS = ["#FF8C00", "#FFD700", "#5A0000", "#FF4500", "#FFA500", "#FFB347"];
  const logoExtensions = ["png", "jpg", "jpeg", "webp", "svg"];

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-[#5A0000] via-[#FF8C00] to-[#FFD700]">
        <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-white shadow-lg"></div>
      </div>
    );

  if (!data.length)
    return (
      <div className="p-6 text-center text-gray-800 text-lg font-semibold">
        Tidak ada data.
      </div>
    );

  const filteredData = data
    .filter(item => item.nama_pemegang_saham.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      let valA = sortKey === "modal" 
        ? Number(a.jumlah_modal_rp.toString().replace(/[^0-9]/g, "")) 
        : a.nama_pemegang_saham.toLowerCase();
      let valB = sortKey === "modal" 
        ? Number(b.jumlah_modal_rp.toString().replace(/[^0-9]/g, "")) 
        : b.nama_pemegang_saham.toLowerCase();
      if (typeof valA === "string") return sortOrder === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valA);
      return sortOrder === "asc" ? valA - valB : valB - valA;
    });

  return (
    <Layout>
      <div className="p-6 min-h-screen bg-gradient-to-br from-[#5A0000] via-[#FF8C00] to-[#32CD32]">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-10 text-center text-white tracking-wide drop-shadow-lg">
          PERSEBARAN KABUPATEN/KOTA PEMEGANG SAHAM PT.BANK RIAU KEPRI SYARIAH PERSERODA
        </h1>

        {/* Search & Sort */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <input
            type="text"
            placeholder="Cari nama pemegang saham..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="p-4 md:w-1/2 w-full rounded-3xl border border-white/50 bg-white/95 text-gray-900 placeholder-gray-400 shadow-lg focus:outline-none focus:ring-4 focus:ring-yellow-400 transition-all"
          />
          <div className="flex gap-3">
            <select
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value)}
              className="p-4 rounded-3xl border border-white/50 bg-white/95 text-gray-900 shadow-lg focus:outline-none focus:ring-4 focus:ring-yellow-400 transition-all"
            >
              <option value="nama">Nama</option>
              <option value="modal">Jumlah Modal</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              className="p-4 rounded-3xl bg-gradient-to-r from-[#5A0000] via-[#FF8C00] to-[#FFD700] text-white font-bold shadow-lg hover:scale-105 hover:shadow-2xl transition-transform"
            >
              {sortOrder === "asc" ? "↑" : "↓"}
            </button>
          </div>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 mb-10">
          {filteredData.map((item, index) => {
            const baseName = item.nama_pemegang_saham
              .toLowerCase()
              .replace(/\s+/g, "_")
              .replace(/[^a-z0-9_]/g, "");
            let logoFile = `/images/${baseName}.png`;
            const handleImageError = (e) => {
              for (let ext of logoExtensions) {
                const path = `/images/${baseName}.${ext}`;
                if (path !== e.target.src) { e.target.src = path; return; }
              }
              e.target.src = "/images/default.png";
            };

            return (
           <div
                key={index}
                className="bg-white/95 rounded-3xl shadow-lg hover:shadow-2xl transition-transform p-6 flex flex-col items-center text-center transform hover:-translate-y-1 hover:scale-105 duration-300"
                style={{
                    borderLeft: "8px solid #FF8C00",    // lebih tebal
                    borderBottom: "8px solid #FFD700", // lebih tebal
                    boxShadow: "0 4px 12px rgba(0,0,0,0.25)", // shadow untuk menonjolkan border
                }}
                >
                <img
                    src={logoFile}
                    alt={item.nama_pemegang_saham}
                    className="w-28 h-28 object-contain mb-5 rounded-full border-2 border-gray-300 shadow-md"
                    onError={handleImageError}
                />
                <h2 className="text-xl font-bold mb-2 text-gray-900">{item.nama_pemegang_saham}</h2>
                <p className="text-gray-800 mb-1">
                    <span className="font-semibold">Modal:</span>{" "}
                    Rp {Number(item.jumlah_modal_rp.toString().replace(/[^0-9]/g, "")).toLocaleString("id-ID")}
                </p>
                <p className="text-gray-800 mb-4">
                    <span className="font-semibold">Komposisi:</span> {item.komposisi_saham}
                </p>
                <Link
                    href="/data-modal"
                    className="px-5 py-2 bg-gradient-to-r from-[#5A0000] via-[#FF8C00] to-[#FFD700] text-white rounded-full shadow-lg hover:scale-105 hover:shadow-xl transition-transform font-semibold"
                >
                    Detail
                </Link>
                </div>

            );
          })}
        </div>

        {/* Bar Chart */}
        <div className="mb-10 bg-white/95 rounded-3xl p-8 shadow-2xl">
          <h2 className="text-3xl font-extrabold mb-6 text-gray-900 text-center drop-shadow-md">
            Jumlah Modal Pemegang Saham
          </h2>
          <ResponsiveContainer width="100%" height={500}>
            <BarChart data={chartData} margin={{ top: 20, right: 40, left: 20, bottom: 80 }}>
              <CartesianGrid stroke="#e0e0e0" strokeDasharray="3 3" />
              <XAxis dataKey="name" interval={0} angle={-40} textAnchor="end" tick={{ fill: "#333", fontSize: 14, fontWeight: 500 }} />
              <YAxis tick={{ fill: "#333", fontSize: 14, fontWeight: 500 }} tickFormatter={(value) => "Rp " + value.toLocaleString("id-ID")} />
              <Tooltip
                contentStyle={{ backgroundColor: "#fff", borderRadius: "10px", border: "1px solid #ddd", boxShadow: "0 2px 12px rgba(0,0,0,0.15)" }}
                formatter={(value) => "Rp " + value.toLocaleString("id-ID")}
              />
              <Bar dataKey="modal" radius={[10, 10, 0, 0]} fill="url(#gradient)" barSize={50} />
              <defs>
                <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FF8C00" stopOpacity={1} />
                  <stop offset="100%" stopColor="#FFD700" stopOpacity={0.8} />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div className="mb-10 bg-white/95 rounded-3xl p-8 shadow-2xl">
          <h2 className="text-3xl font-extrabold mb-6 text-gray-900 text-center drop-shadow-md">
            Persentase Kepemilikan Saham
          </h2>
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={150}
                innerRadius={60}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
              >
                {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
              </Pie>
              <Tooltip
                formatter={(value) => `${value.toFixed(2)}%`}
                contentStyle={{ backgroundColor: "#fff", borderRadius: "10px", border: "1px solid #ddd", boxShadow: "0 2px 12px rgba(0,0,0,0.15)" }}
              />
            </PieChart>
          </ResponsiveContainer>
          <p className="text-center mt-4 font-semibold text-gray-900 text-lg">
            Total Keseluruhan: {totalPersentase.toFixed(2)}%
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default PSaham;
