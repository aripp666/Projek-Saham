import React from "react";
import Layout from "../Layouts/Layout";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade, Pagination } from "swiper/modules";
import { motion } from "framer-motion";

import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/pagination";

const Dashboard = () => {
  const images = [
    "/images/brk2.jpg",
    "/images/brk5.jpg",
    "/images/brk6.jpg",
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative w-full min-h-screen flex items-center overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-[#5A0000] via-[#FF8C00] to-[#32CD32]"></div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 w-full flex flex-col-reverse lg:flex-row items-center lg:items-start lg:justify-between gap-8 sm:gap-12 py-12">
          {/* Text Hero */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1 }}
            className="w-full lg:w-1/2 text-center lg:text-left space-y-6 font-sans"
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl xl:text-6xl font-extrabold text-white drop-shadow-2xl leading-snug sm:leading-tight tracking-wide font-serif">
              DAFTAR URUTAN KOMPOSISI PEMEGANG SAHAM
            </h1>
            <p className="text-white text-lg sm:text-xl md:text-2xl leading-relaxed">
              PT BANK RIAU KEPRI SYARIAH PERSERODA
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mt-6">
              <motion.a
                href="/PSaham"
                whileHover={{ scale: 1.05 }}
                className="px-6 py-3 bg-gradient-to-r from-[#FFD700] to-[#FF8C00] text-white font-bold rounded-full shadow-lg hover:shadow-2xl transition-all duration-300 text-center"
              >
                Lihat Data Pemegang Saham
              </motion.a>
            </div>
          </motion.div>

          {/* Swiper Image Hero */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1.2 }}
            className="w-full lg:w-1/2 relative rounded-3xl overflow-hidden shadow-2xl"
          >
            <Swiper
              modules={[Autoplay, EffectFade, Pagination]}
              spaceBetween={0}
              slidesPerView={1}
              effect="fade"
              loop={true}
              autoplay={{ delay: 4000, disableOnInteraction: false }}
              pagination={{ clickable: true }}
              className="w-full h-64 sm:h-80 md:h-96 lg:h-[24rem] xl:h-[28rem] rounded-3xl"
            >
              {images.map((img, idx) => (
                <SwiperSlide key={idx}>
                  <div className="relative w-full h-full rounded-3xl overflow-hidden">
                    <img
                      src={img}
                      alt={`Slide ${idx + 1}`}
                      className="w-full h-full object-cover rounded-3xl transition-transform duration-1000 ease-in-out hover:scale-105"
                      style={{ filter: "brightness(0.8)" }}
                    />
                    {/* Dark overlay agar teks terlihat */}
                    <div className="absolute inset-0 bg-black/20 pointer-events-none rounded-3xl"></div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>

            <style>{`
              .swiper-pagination-bullet {
                background: #FFFFFF;
                opacity: 0.6;
              }
              .swiper-pagination-bullet-active {
                background: #FFD700;
                opacity: 1;
              }
            `}</style>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default Dashboard;
