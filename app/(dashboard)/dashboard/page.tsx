"use client";

import { AuthGuard } from "../../../lib/auth-guard";
import { useRouter } from "next/navigation";

function DashboardContent() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg p-8">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Dashboard
              </h2>
              <p className="text-gray-600 mb-8">
                Bienvenido al sistema de predicción de demanda. Aquí podrás
                gestionar tus productos, materiales y ventas.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Productos
                  </h3>
                  <p className="text-gray-600">
                    Gestiona tu catálogo de productos
                  </p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Materiales
                  </h3>
                  <p className="text-gray-600">
                    Controla tu inventario de materiales
                  </p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Ventas
                  </h3>
                  <p className="text-gray-600">Registra y analiza tus ventas</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function Dashboard() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  );
}
