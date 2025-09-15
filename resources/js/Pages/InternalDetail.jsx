import React from "react";
import Layout from "@/Layouts/Layout";
import { motion } from "framer-motion";

export default function InternalDetail({ pdf }) {
  return (
    <Layout>
      <div className="p-6 md:p-10 min-h-screen bg-gradient-to-br from-[#5A0000] via-[#FF8C00] to-[#FFD700] text-white flex flex-col items-center">
        {/* Judul */}
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-3xl md:text-5xl font-extrabold mb-8 text-center drop-shadow-lg"
        >
          📄 {pdf.judul}
        </motion.h1>

        {/* PDF Viewer */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white rounded-2xl shadow-2xl overflow-hidden w-full max-w-5xl"
        >
          <iframe
            src={`/storage/${pdf.file}#toolbar=1&navpanes=0`}
            title={pdf.judul}
            className="w-full h-[75vh] md:h-[85vh] border-0"
          ></iframe>
        </motion.div>

        {/* Tombol Download */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-8"
        >
          <a
            href={`/storage/${pdf.file}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-8 py-4 bg-gradient-to-r from-[#32CD32] to-[#FFD700] rounded-xl text-white font-bold shadow-lg hover:scale-105 hover:shadow-xl transition-transform duration-300"
          >
            📥 Download PDF
          </a>
        </motion.div>
      </div>
    </Layout>
  );
}
