"use client";

import Link from "next/link";
import { useAuth } from "../lib/auth-context";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  return (
    <header className="bg-black shadow fixed top-0 w-full z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center py-6 gap-4">
          <div className="flex items-center gap-4">
            <div className="flex justify-center mb-4">
              <Image
                src="/logo-bm-black.png"
                alt="BiMetal Logo"
                width={200}
                height={70}
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
              <Link
                href="/materials"
                className="px-3 py-2 rounded-md hover:bg-gray-700 hover:text-white"
              >
                Materiales
              </Link>
              <Link
                href="/products"
                className="px-3 py-2 rounded-md hover:bg-gray-700 hover:text-white"
              >
                Productos
              </Link>
              <Link
                href="/sales"
                className="px-3 py-2 rounded-md hover:bg-gray-700 hover:text-white"
              >
                Ventas
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
