"use client";

"use client";

import { useEffect, useState } from "react";

type ProjectionData = {
  products: {
    id: string;
    name: string;
    currentStock: number;
    safetyStock: number;
    projectedSales: {
      month: string;
      quantity: number;
    }[];
    status: "normal" | "warning" | "critical";
  }[];
  alerts: {
    type: "product" | "material";
    id: string;
    name: string;
    message: string;
    severity: "warning" | "critical";
  }[];
};

type AlertSummary = {
  critical: number;
  warning: number;
};

export default function ProjectionsPage() {
  const [data, setData] = useState<ProjectionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedAlerts, setExpandedAlerts] = useState<{
    [key: string]: boolean;
  }>({});

  const [productSearch, setProductSearch] = useState("");
  const [productPage, setProductPage] = useState(1);
  const [productStatusFilter, setProductStatusFilter] = useState<
    "all" | "normal" | "warning" | "critical"
  >("all");
  const [productSortBy, setProductSortBy] = useState<"name" | "stock">("name");
  const itemsPerPage = 15;

  useEffect(() => {
    fetchProjections();
  }, []);

  const fetchProjections = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/projections");
      if (!res.ok) throw new Error("Error al cargar proyecciones");
      const projectionData = await res.json();
      setData(projectionData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  const toggleAlertExpansion = (severity: string) => {
    setExpandedAlerts((prev) => ({ ...prev, [severity]: !prev[severity] }));
  };

  const getAlertSummary = (): AlertSummary => {
    if (!data) return { critical: 0, warning: 0 };
    return data.alerts.reduce(
      (acc, alert) => {
        acc[alert.severity]++;
        return acc;
      },
      { critical: 0, warning: 0 } as AlertSummary,
    );
  };

  const filteredProducts =
    data?.products
      .filter(
        (product) =>
          product.name.toLowerCase().includes(productSearch.toLowerCase()) &&
          (productStatusFilter === "all" ||
            product.status === productStatusFilter),
      )
      .sort((a, b) => {
        if (productSortBy === "name") return a.name.localeCompare(b.name);
        return b.currentStock - a.currentStock;
      }) || [];

  const totalProductPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (productPage - 1) * itemsPerPage,
    productPage * itemsPerPage,
  );

  useEffect(() => {
    setProductPage(1);
  }, [productSearch]);

  if (loading)
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Error al cargar proyecciones
                </h3>
                <div className="mt-2 text-sm text-red-700">{error}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );

  if (!data) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "critical":
        return "bg-red-50 text-red-700 border-red-200";
      case "warning":
        return "bg-amber-50 text-amber-700 border-amber-200";
      default:
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
    }
  };

  const getSeverityColor = (severity: string) =>
    severity === "critical"
      ? "bg-red-50 border-red-200 text-red-700"
      : "bg-amber-50 border-amber-200 text-amber-700";

  const calculateABC = <T extends { id: string; name: string }>(
    items: T[],
    getTotal: (item: T) => number,
  ) => {
    type ItemWithTotal = T & { total: number };
    const totals: ItemWithTotal[] = items.map((item) => ({
      ...item,
      total: getTotal(item),
    }));
    const totalSum = totals.reduce((sum, item) => sum + item.total, 0);
    let cumulative = 0;
    const sorted = totals.sort((a, b) => b.total - a.total);
    const accInit = {
      A: [] as ItemWithTotal[],
      B: [] as ItemWithTotal[],
      C: [] as ItemWithTotal[],
    };
    return sorted.reduce((acc, item) => {
      const share = totalSum > 0 ? (cumulative + item.total) / totalSum : 0;
      cumulative += item.total;
      if (share <= 0.7) acc.A.push(item);
      else if (share <= 0.9) acc.B.push(item);
      else acc.C.push(item);
      return acc;
    }, accInit);
  };

  const productABC = calculateABC(data.products, (product) =>
    product.projectedSales.reduce((sum, proj) => sum + proj.quantity, 0),
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Proyecciones de Demanda
            </h1>
            <p className="mt-2 text-gray-600">
              Análisis de productos basado en los movimientos de stock de tipo
              salida.
            </p>
          </div>
          <button
            onClick={fetchProjections}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition"
          >
            Actualizar
          </button>
        </div>

        {/* Alertas */}
        {data.alerts.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              Alertas de Stock
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <button
                onClick={() => toggleAlertExpansion("critical")}
                className="bg-red-50 border border-red-200 rounded-lg p-4 hover:bg-red-100 transition cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <svg
                      className="w-6 h-6 text-red-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <div>
                      <h3 className="font-medium text-red-800">Críticas</h3>
                      <p className="text-sm text-red-600">
                        {getAlertSummary().critical} alertas
                      </p>
                    </div>
                  </div>
                  <svg
                    className={`w-5 h-5 text-red-500 transform transition-transform ${expandedAlerts.critical ? "rotate-180" : ""}`}
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
                </div>
              </button>

              <button
                onClick={() => toggleAlertExpansion("warning")}
                className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 hover:bg-yellow-100 transition cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <svg
                      className="w-6 h-6 text-yellow-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <div>
                      <h3 className="font-medium text-yellow-800">
                        Advertencias
                      </h3>
                      <p className="text-sm text-yellow-600">
                        {getAlertSummary().warning} alertas
                      </p>
                    </div>
                  </div>
                  <svg
                    className={`w-5 h-5 text-yellow-500 transform transition-transform ${expandedAlerts.warning ? "rotate-180" : ""}`}
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
                </div>
              </button>
            </div>

            {expandedAlerts.critical && (
              <div className="mb-4">
                <h3 className="text-lg font-medium text-red-800 mb-3">
                  Alertas Críticas
                </h3>
                <div className="space-y-3">
                  {data.alerts
                    .filter((alert) => alert.severity === "critical")
                    .map((alert, index) => (
                      <div
                        key={index}
                        className={`p-4 rounded-lg border ${getSeverityColor(alert.severity)}`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0">
                            <svg
                              className="w-5 h-5 text-red-500"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">
                              {alert.name}
                            </h4>
                            <p className="text-sm text-gray-600 mt-1">
                              {alert.message}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {expandedAlerts.warning && (
              <div className="mb-4">
                <h3 className="text-lg font-medium text-yellow-800 mb-3">
                  Alertas de Advertencia
                </h3>
                <div className="space-y-3">
                  {data.alerts
                    .filter((alert) => alert.severity === "warning")
                    .map((alert, index) => (
                      <div
                        key={index}
                        className={`p-4 rounded-lg border ${getSeverityColor(alert.severity)}`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0">
                            <svg
                              className="w-5 h-5 text-yellow-500"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">
                              {alert.name}
                            </h4>
                            <p className="text-sm text-gray-600 mt-1">
                              {alert.message}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Análisis ABC */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Análisis ABC
              </h2>
              <p className="text-gray-600">
                Clasifica los productos según su demanda proyectada.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3 w-full md:w-auto">
              {[
                {
                  label: "A",
                  description: "Alta prioridad",
                  color: "bg-emerald-100 text-emerald-700",
                },
                {
                  label: "B",
                  description: "Prioridad media",
                  color: "bg-amber-100 text-amber-700",
                },
                {
                  label: "C",
                  description: "Prioridad baja",
                  color: "bg-slate-100 text-slate-700",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className={`${item.color} rounded-lg border border-gray-200 p-3`}
                >
                  <div className="text-sm font-semibold">
                    Clase {item.label}
                  </div>
                  <div className="text-xs text-gray-600">
                    {item.description}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                {[
                  {
                    label: "A",
                    count: productABC.A.length,
                    subtitle: "Productos",
                    tint: "bg-emerald-50 text-emerald-700",
                  },
                  {
                    label: "B",
                    count: productABC.B.length,
                    subtitle: "Productos",
                    tint: "bg-amber-50 text-amber-700",
                  },
                  {
                    label: "C",
                    count: productABC.C.length,
                    subtitle: "Productos",
                    tint: "bg-slate-50 text-slate-700",
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className={`${item.tint} rounded-lg border border-gray-200 p-4`}
                  >
                    <div className="text-sm font-medium">
                      Clase {item.label}
                    </div>
                    <div className="mt-2 text-3xl font-bold">{item.count}</div>
                    <div className="text-sm text-gray-500">{item.subtitle}</div>
                  </div>
                ))}
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Top productos clase A
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-gray-800">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left font-medium text-gray-700">
                          Producto
                        </th>
                        <th className="px-4 py-3 text-left font-medium text-gray-700">
                          Demanda 3 meses
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {productABC.A.slice(0, 5).map(
                        (product: {
                          id: string;
                          name: string;
                          total: number;
                        }) => (
                          <tr
                            key={product.id}
                            className="hover:bg-gray-50 transition"
                          >
                            <td className="px-4 py-3">{product.name}</td>
                            <td className="px-4 py-3 font-medium text-gray-900">
                              {product.total}
                            </td>
                          </tr>
                        ),
                      )}
                      {productABC.A.length === 0 && (
                        <tr>
                          <td
                            colSpan={2}
                            className="px-4 py-4 text-center text-gray-500"
                          >
                            No hay productos en la clase A
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Proyecciones de Productos */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              Proyecciones de Ventas - Productos
            </h2>
            <div className="flex flex-wrap gap-3">
              <div className="relative">
                <svg
                  className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <input
                  type="text"
                  placeholder="Buscar productos..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <select
                value={productStatusFilter}
                onChange={(e) =>
                  setProductStatusFilter(
                    e.target.value as "all" | "normal" | "warning" | "critical",
                  )
                }
                className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="all">Todos los estados</option>
                <option value="critical">Crítico</option>
                <option value="warning">Advertencia</option>
                <option value="normal">Normal</option>
              </select>

              <select
                value={productSortBy}
                onChange={(e) =>
                  setProductSortBy(e.target.value as "name" | "stock")
                }
                className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="name">Ordenar por: Nombre</option>
                <option value="stock">Ordenar por: Stock</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Producto
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Stock Actual
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Stock Seguridad
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Estado
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Próximos 3 Meses
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginatedProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {product.name}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {product.currentStock}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {product.safetyStock}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(product.status)}`}
                      >
                        {product.status === "critical"
                          ? "Crítico"
                          : product.status === "warning"
                            ? "Advertencia"
                            : "Normal"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex gap-4">
                        {product.projectedSales.map((proj, index) => (
                          <div key={index} className="text-center">
                            <div className="text-xs text-gray-500">
                              {proj.month}
                            </div>
                            <div className="font-medium text-gray-900">
                              {proj.quantity}
                            </div>
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Paginación productos */}
          {totalProductPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-700">
                Mostrando {(productPage - 1) * itemsPerPage + 1} a{" "}
                {Math.min(productPage * itemsPerPage, filteredProducts.length)}{" "}
                de {filteredProducts.length} productos
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() =>
                    setProductPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={productPage === 1}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  Anterior
                </button>
                <span className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-lg">
                  Página {productPage} de {totalProductPages}
                </span>
                <button
                  onClick={() =>
                    setProductPage((prev) =>
                      Math.min(prev + 1, totalProductPages),
                    )
                  }
                  disabled={productPage === totalProductPages}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
