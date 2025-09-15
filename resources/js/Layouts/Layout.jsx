import React, { useState } from "react";
import { Link, usePage } from "@inertiajs/react";

const Layout = ({ children }) => {
  const { url } = usePage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // state dropdown desktop
  const [homeDropdownOpen, setHomeDropdownOpen] = useState(false);
  const [dataSahamDropdownOpen, setDataSahamDropdownOpen] = useState(false);

  // state dropdown mobile
  const [homeDropdownMobile, setHomeDropdownMobile] = useState(false);
  const [dataSahamDropdownMobile, setDataSahamDropdownMobile] = useState(false);

  // menu utama selain Home & Data Saham
  const menuItems = [
    { name: "Pemegang Saham", href: "/PSaham" },
    { name: "Deviden", href: "/data-modal" },
    { name: "Peraturan Daerah", href: "/Perda" },
  ];

  // submenu Home
  const homeSubMenu = [
    { name: "Landing Page", href: "/" },
    { name: "Ketentuan Internal", href: "/internal" },
    { name: "Ketentuan Eksternal", href: "/external" },
  ];

  // submenu Data Pemegang Saham
  const dataSahamSubMenu = [
    { name: "Komposisi Pemegang Saham", href: "/data-saham" },
    { name: "Rencana Setoran Modal", href: "/rencana-setoran" }, // belum ada, pakai #
  ];

  return (
    <div className="flex flex-col min-h-screen font-sans">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#5A0000] via-[#FF8C00] to-[#32CD32] text-white sticky top-0 z-50 shadow-md">
        <div className="container mx-auto flex flex-wrap justify-between items-center p-6 md:p-8">
          <Link href="/">
            <img
              src="/images/logobrk1.png"
              alt="BRK Syariah"
              className="h-12 md:h-14 transition-transform duration-300 hover:scale-105"
            />
          </Link>

          {/* Tombol Hamburger */}
          <button
            className="md:hidden flex items-center px-3 py-2 border rounded text-white border-white hover:text-yellow-300 hover:border-yellow-300"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <svg
              className="fill-current h-6 w-6"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <title>Menu</title>
              {mobileMenuOpen ? (
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 
                  111.414 1.414L11.414 10l4.293 4.293a1 1 0 
                  01-1.414 1.414L10 11.414l-4.293 
                  4.293a1 1 0 
                  01-1.414-1.414L8.586 10 4.293 
                  5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              ) : (
                <path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z" />
              )}
            </svg>
          </button>

          {/* Menu Desktop */}
          <nav className="hidden md:flex items-center gap-6 text-base md:text-lg font-semibold">
            {/* Dropdown Home */}
            <div className="relative">
              <button
                onClick={() => setHomeDropdownOpen(!homeDropdownOpen)}
                className={`px-4 py-2 rounded-full transition-all duration-300 ${
                  url === "/" || homeSubMenu.some((sub) => url === sub.href)
                    ? "bg-yellow-300 text-black shadow-md scale-105"
                    : "hover:bg-yellow-200/30 hover:text-yellow-300"
                }`}
              >
                Home
              </button>
              {homeDropdownOpen && (
                <div className="absolute left-0 mt-2 w-56 bg-white text-black rounded-lg shadow-lg overflow-hidden">
                  {homeSubMenu.map((sub) => (
                    <Link
                      key={sub.name}
                      href={sub.href}
                      className={`block px-4 py-2 hover:bg-yellow-200 ${
                        url === sub.href ? "bg-yellow-300 font-semibold" : ""
                      }`}
                      onClick={() => setHomeDropdownOpen(false)}
                    >
                      {sub.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Dropdown Data Pemegang Saham */}
            <div className="relative">
              <button
                onClick={() => setDataSahamDropdownOpen(!dataSahamDropdownOpen)}
                className={`px-4 py-2 rounded-full transition-all duration-300 ${
                  dataSahamSubMenu.some((sub) => url === sub.href)
                    ? "bg-yellow-300 text-black shadow-md scale-105"
                    : "hover:bg-yellow-200/30 hover:text-yellow-300"
                }`}
              >
                Data Pemegang Saham
              </button>
              {dataSahamDropdownOpen && (
                <div className="absolute left-0 mt-2 w-64 bg-white text-black rounded-lg shadow-lg overflow-hidden">
                  {dataSahamSubMenu.map((sub) => (
                    <Link
                      key={sub.name}
                      href={sub.href}
                      className={`block px-4 py-2 hover:bg-yellow-200 ${
                        url === sub.href ? "bg-yellow-300 font-semibold" : ""
                      }`}
                      onClick={() => setDataSahamDropdownOpen(false)}
                    >
                      {sub.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Menu lainnya */}
            {menuItems.map((item) => {
              const isActive = url === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`px-4 py-2 rounded-full transition-all duration-300 ${
                    isActive
                      ? "bg-yellow-300 text-black shadow-md scale-105"
                      : "hover:bg-yellow-200/30 hover:text-yellow-300"
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Menu Mobile */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-gradient-to-r from-[#5A0000] via-[#FF8C00] to-[#32CD32] text-white shadow-md">
            <nav className="flex flex-col gap-2 p-4">
              {/* Dropdown Home */}
              <div>
                <button
                  onClick={() => setHomeDropdownMobile(!homeDropdownMobile)}
                  className="w-full text-left px-4 py-2 rounded-full hover:bg-yellow-200/30 hover:text-yellow-300"
                >
                  Home {homeDropdownMobile ? "▲" : "▼"}
                </button>
                {homeDropdownMobile && (
                  <div className="ml-4 flex flex-col gap-1">
                    {homeSubMenu.map((sub) => (
                      <Link
                        key={sub.name}
                        href={sub.href}
                        className={`px-4 py-2 rounded-full transition-all duration-300 ${
                          url === sub.href
                            ? "bg-yellow-300 text-black shadow-md"
                            : "hover:bg-yellow-200/30 hover:text-yellow-300"
                        }`}
                        onClick={() => {
                          setMobileMenuOpen(false);
                          setHomeDropdownMobile(false);
                        }}
                      >
                        {sub.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Dropdown Data Saham */}
              <div>
                <button
                  onClick={() =>
                    setDataSahamDropdownMobile(!dataSahamDropdownMobile)
                  }
                  className="w-full text-left px-4 py-2 rounded-full hover:bg-yellow-200/30 hover:text-yellow-300"
                >
                  Data Pemegang Saham {dataSahamDropdownMobile ? "▲" : "▼"}
                </button>
                {dataSahamDropdownMobile && (
                  <div className="ml-4 flex flex-col gap-1">
                    {dataSahamSubMenu.map((sub) => (
                      <Link
                        key={sub.name}
                        href={sub.href}
                        className={`px-4 py-2 rounded-full transition-all duration-300 ${
                          url === sub.href
                            ? "bg-yellow-300 text-black shadow-md"
                            : "hover:bg-yellow-200/30 hover:text-yellow-300"
                        }`}
                        onClick={() => {
                          setMobileMenuOpen(false);
                          setDataSahamDropdownMobile(false);
                        }}
                      >
                        {sub.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Menu lainnya */}
              {menuItems.map((item) => {
                const isActive = url === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`px-4 py-2 rounded-full transition-all duration-300 ${
                      isActive
                        ? "bg-yellow-300 text-black shadow-md"
                        : "hover:bg-yellow-200/30 hover:text-yellow-300"
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
        )}
      </header>

      {/* Konten utama */}
      <main className="flex-grow relative z-0">{children}</main>

      {/* Footer */}
      <footer className="footer footer-horizontal footer-center bg-gradient-to-br from-[#5A0000] via-[#FF8C00] to-[#32CD32] text-white p-10 mt-auto">
        <aside className="flex flex-col items-center gap-3 md:gap-4">
          <div>
            <img
              src="/images/logobrk1.png"
              alt="BRK Syariah"
              className="h-12 md:h-14 transition-transform duration-300 hover:scale-110"
            />
          </div>
          <p className="font-bold text-lg md:text-xl text-center">BRK Syariah</p>
          <p className="text-center text-sm md:text-base">
            &copy; {new Date().getFullYear()} - Pencari Tuhan All rights reserved
          </p>
          <p className="text-center text-sm md:text-base leading-relaxed">
            Jl. Jenderal Sudirman No.123, Pekanbaru, Riau
            <br />
            Email: info@brksyariah.co.id | Telp: (0761) 123456
          </p>
        </aside>
      </footer>
    </div>
  );
};

export default Layout;
