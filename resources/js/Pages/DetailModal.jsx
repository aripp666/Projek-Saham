import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { usePage } from '@inertiajs/react';

export default function DetailModal() {
  const { sheet } = usePage().props; // props dari Inertia
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sheet) return;

    const fetchData = async () => {
      try {
        const res = await axios.get('/api/data-modal', {
          params: { table_name: 'data_modal', sheet },
        });
        setData(res.data.data);
      } catch (err) {
        console.error(err);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [sheet]);

  if (loading) return <p className="p-6">Loading...</p>;
  if (!data.length) return <p className="p-6">Tidak ada data untuk {sheet}</p>;

  const headers = Object.keys(data[0]);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Detail Data: {sheet}</h1>
      <div className="overflow-x-auto">
        <table className="w-full border">
          <thead>
            <tr className="bg-gray-200">
              {headers.map((h, i) => (
                <th key={i} className="border px-3 py-1">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={i} className={i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                {headers.map((h, j) => (
                  <td key={j} className="border px-2 py-1">{row[h]}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
