"use client";

import Link from "next/link";
import { useAuth } from "../lib/auth-context";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useState } from "react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isMaterialsOpen, setIsMaterialsOpen] = useState(false);
  const [isProductsOpen, setIsProductsOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.replace("/");
  };

  return (
    <header className="bg-black shadow fixed top-0 w-full z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center py-6 gap-4">
          <div className="flex items-center gap-4">
            <div className="flex">
              <Image
                src="/logo-bm-black.png"
                alt="BiMetal Logo"
                width={120}
                height={50}
                priority
              />
            </div>
            <nav className="flex flex-wrap items-center gap-2 text-sm text-white">
              <Link
                href="/dashboard"
                className="px-3 py-2 rounded-md hover:bg-gray-700 hover:text-white"
              >
                Inicio
              </Link>

              {/* Dropdown Materiales */}
              <div className="relative">
                <button
                  onClick={() => {
                    setIsMaterialsOpen(!isMaterialsOpen);
                    setIsProductsOpen(false);
                  }}
                  className="px-3 py-2 rounded-md hover:bg-gray-700 bg-transparent hover:text-white flex items-center gap-1"
                >
                  Materiales
                  <svg
                    className={`w-4 h-4 transition-transform ${
                      isMaterialsOpen ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {isMaterialsOpen && (
                  <div className="absolute top-full left-0 mt-1 bg-white rounded-md shadow-lg border border-gray-200 py-1 min-w-[180px]">
                    <Link
                      href="/materials"
                      className="block px-4 py-2 text-sm bg-white text-black hover:bg-gray-800 hover:text-white"
                      onClick={() => setIsMaterialsOpen(false)}
                    >
                      Gestionar Materiales
                    </Link>
                    <Link
                      href="/material-replenishments"
                      className="block px-4 py-2 text-sm bg-white text-black hover:bg-gray-800 hover:text-white"
                      onClick={() => setIsMaterialsOpen(false)}
                    >
                      Reabastecimiento
                    </Link>
                  </div>
                )}
              </div>

              {/* Dropdown Productos */}
              <div className="relative">
                <button
                  onClick={() => {
                    setIsProductsOpen(!isProductsOpen);
                    setIsMaterialsOpen(false);
                  }}
                  className="px-3 py-2 rounded-md hover:bg-gray-700 bg-transparent hover:text-white flex items-center gap-1"
                >
                  Productos
                  <svg
                    className={`w-4 h-4 transition-transform ${
                      isProductsOpen ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {isProductsOpen && (
                  <div className="absolute top-full left-0 mt-1 bg-white rounded-md shadow-lg border border-gray-200 py-1 min-w-[180px]">
                    <Link
                      href="/products"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-800 hover:text-white"
                      onClick={() => setIsProductsOpen(false)}
                    >
                      Gestionar Productos
                    </Link>
                    <Link
                      href="/product-replenishments"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-800 hover:text-white"
                      onClick={() => setIsProductsOpen(false)}
                    >
                      Reabastecimiento
                    </Link>
                  </div>
                )}
              </div>

              <Link
                href="/ventas"
                className="px-3 py-2 rounded-md hover:bg-gray-700 hover:text-white"
              >
                Ventas
              </Link>
              <Link
                href="/projections"
                className="px-3 py-2 rounded-md hover:bg-gray-700 hover:text-white"
              >
                Proyecciones
              </Link>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-300">
              Bienvenido, {user?.email}
            </span>
            <button
              onClick={handleLogout}
              className="bg-[#F05A00] hover:bg-[#FF6A00] text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
