"use client";

import { Fragment, useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type ProjectionData = {
  products: {
    id: string;
    name: string;
    currentStock: number;
    safetyStock: number;
    projectedSales: {
      month: string;
      quantity: number;
      actual: number | null;
      difference: number | null;
      percentageError: number | null;
    }[];
    nextMonthProjection: number;
    branchId: string | null;
    branchName: string | null;
    actualMonths: string[];
    monthlyActuals: number[];
    simpleMovingAverage: number;
    movingAverage: number;
    weightedMovingAverage: number;
    exponentialSmoothing: number;
    mapeSimple: number;
    mapeWeighted: number;
    mapeExponential: number;
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
  const [expandedProductIds, setExpandedProductIds] = useState<
    Record<string, boolean>
  >({});
  const itemsPerPage = 15;

  const [branches, setBranches] = useState<{ id: string; name: string }[]>([]);
  const [branchFilter, setBranchFilter] = useState<string>("all");

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
      setBranches(projectionData.branches ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  const toggleAlertExpansion = (severity: string) => {
    setExpandedAlerts((prev) => ({ ...prev, [severity]: !prev[severity] }));
  };

  const toggleProductExpansion = (productId: string) => {
    setExpandedProductIds((prev) => ({
      ...prev,
      [productId]: !prev[productId],
    }));
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
            product.status === productStatusFilter) &&
          (branchFilter === "all" || product.branchId === branchFilter),
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

  const getComparisonBadgeClass = (
    projected: number,
    actual: number | null,
  ) => {
    if (actual === null) return "bg-slate-100 text-slate-700 border-slate-200";
    return actual >= projected
      ? "bg-emerald-100 text-emerald-700 border-emerald-200"
      : "bg-rose-100 text-rose-700 border-rose-200";
  };

  const formatDifference = (projected: number, actual: number | null) => {
    if (actual === null) return "—";
    const diff = actual - projected;
    const sign = diff > 0 ? "+" : "";
    return `${sign}${diff}`;
  };

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
                value={branchFilter}
                onChange={(e) => setBranchFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="all">Todas las sucursales</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>

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
                    Sucursal
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Stock
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Estado
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Proyección próximo mes
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                    Detalle
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginatedProducts.map((product) => {
                  const isExpanded = expandedProductIds[product.id];
                  const totalProjected = product.nextMonthProjection;

                  return (
                    <Fragment key={product.id}>
                      <tr className="hover:bg-gray-50 transition">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          {product.name}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          <div className="text-sm">
                            {product.branchName ?? "-"}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          <div>{product.currentStock}</div>
                          <div className="text-xs text-gray-500">
                            Seguridad {product.safetyStock}
                          </div>
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
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {totalProjected}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => toggleProductExpansion(product.id)}
                            className="bg-indigo-600 text-white px-3 py-1 rounded text-sm font-medium hover:bg-indigo-700"
                          >
                            {isExpanded ? "Ocultar" : "Ver detalles"}
                          </button>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr className="bg-slate-50">
                          <td colSpan={6} className="px-4 py-4">
                            <div className="grid gap-4 lg:grid-cols-4">
                              <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="text-sm font-semibold text-slate-900">
                                      Cálculos de pronóstico
                                    </p>
                                    <p className="mt-1 text-xs text-slate-500">
                                      Modelos de series temporales
                                    </p>
                                  </div>
                                  <span className="inline-flex items-center rounded-full bg-indigo-100 px-2.5 py-1 text-xs font-semibold text-indigo-700">
                                    Modelos
                                  </span>
                                </div>
                                <div className="mt-5 space-y-3 text-sm text-slate-700">
                                  <div className="flex items-center justify-between gap-4">
                                    <span>Promedio móvil simple</span>
                                    <span className="font-semibold text-slate-900">
                                      {product.simpleMovingAverage}
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-between gap-4">
                                    <span>Promedio móvil</span>
                                    <span className="font-semibold text-slate-900">
                                      {product.movingAverage}
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-between gap-4">
                                    <span>Ponderado</span>
                                    <span className="font-semibold text-slate-900">
                                      {product.weightedMovingAverage}
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-between gap-4">
                                    <span>Suavizado exp.</span>
                                    <span className="font-semibold text-slate-900">
                                      {product.exponentialSmoothing}
                                    </span>
                                  </div>
                                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900">
                                    <div className="flex items-center justify-between">
                                      <span>MAPE</span>
                                      <span className="font-semibold">
                                        {product.mapeSimple}%
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="text-sm font-semibold text-slate-900">
                                      Demandas reales
                                    </p>
                                    <p className="mt-1 text-xs text-slate-500">
                                      Últimos meses registrados
                                    </p>
                                  </div>
                                  <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                                    Histórico
                                  </span>
                                </div>
                                <div className="mt-5 space-y-3 text-sm text-slate-700">
                                  {product.actualMonths.map((month, index) => (
                                    <div
                                      key={month}
                                      className="flex items-center justify-between rounded-2xl bg-slate-50 px-3 py-2"
                                    >
                                      <span>{month}</span>
                                      <span className="font-semibold text-slate-900">
                                        {product.monthlyActuals[index]}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                              <div className="col-span-1 lg:col-span-2 rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="text-sm font-semibold text-slate-900">
                                      Proyección vs Real
                                    </p>
                                    <p className="mt-1 text-xs text-slate-500">
                                      Comparación mensual con colores intuitivos
                                    </p>
                                  </div>
                                  <div className="flex gap-2 items-center text-xs text-slate-500">
                                    <span className="inline-flex h-2 w-2 rounded-full bg-indigo-500" />
                                    <span>Proyección</span>
                                    <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                                    <span>Real</span>
                                  </div>
                                </div>
                                <div className="mt-5 overflow-x-auto">
                                  <table className="min-w-full text-sm text-slate-700">
                                    <thead className="border-b border-slate-200 text-left text-[11px] uppercase tracking-[0.18em] text-slate-500">
                                      <tr>
                                        <th className="px-3 py-3">Mes</th>
                                        <th className="px-3 py-3">
                                          Proyección
                                        </th>
                                        <th className="px-3 py-3">Real</th>
                                        <th className="px-3 py-3">
                                          Diferencia
                                        </th>
                                        <th className="px-3 py-3">Error</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200">
                                      {product.projectedSales.map((proj) => {
                                        const isAbove =
                                          proj.actual !== null &&
                                          proj.actual >= proj.quantity;
                                        const badgeClass =
                                          getComparisonBadgeClass(
                                            proj.quantity,
                                            proj.actual,
                                          );
                                        return (
                                          <tr
                                            key={proj.month}
                                            className={
                                              proj.actual === null
                                                ? "bg-slate-50"
                                                : isAbove
                                                  ? "bg-emerald-50/40"
                                                  : "bg-rose-50/40"
                                            }
                                          >
                                            <td className="px-3 py-3 text-sm text-slate-900 font-medium">
                                              {proj.month}
                                            </td>
                                            <td className="px-3 py-3 font-semibold text-slate-900">
                                              {proj.quantity}
                                            </td>
                                            <td className="px-3 py-3 font-semibold text-slate-900">
                                              {proj.actual ?? "—"}
                                            </td>
                                            <td className="px-3 py-3">
                                              <span
                                                className={`inline-flex rounded-full border px-2 py-1 text-[11px] font-semibold ${proj.actual === null ? "border-slate-200 text-slate-500 bg-slate-100" : proj.actual >= proj.quantity ? "border-emerald-200 text-emerald-700 bg-emerald-100" : "border-rose-200 text-rose-700 bg-rose-100"}`}
                                              >
                                                {formatDifference(
                                                  proj.quantity,
                                                  proj.actual,
                                                )}
                                              </span>
                                            </td>
                                            <td className="px-3 py-3">
                                              <span
                                                className={`inline-flex rounded-full border px-2 py-1 text-[11px] font-semibold ${badgeClass}`}
                                              >
                                                {proj.percentageError === null
                                                  ? "N/D"
                                                  : `${proj.percentageError}%`}
                                              </span>
                                            </td>
                                          </tr>
                                        );
                                      })}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                              <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="text-sm font-semibold text-slate-900">
                                      Resumen rápido
                                    </p>
                                    <p className="mt-1 text-xs text-slate-500">
                                      Métricas clave del producto
                                    </p>
                                  </div>
                                  <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                                    Actual
                                  </span>
                                </div>
                                <div className="mt-5 space-y-3 text-sm text-slate-700">
                                  <div className="rounded-2xl bg-slate-50 px-4 py-3">
                                    <div className="flex items-center justify-between text-slate-600">
                                      <span>Stock actual</span>
                                      <span className="font-semibold text-slate-900">
                                        {product.currentStock}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="rounded-2xl bg-slate-50 px-4 py-3">
                                    <div className="flex items-center justify-between text-slate-600">
                                      <span>Stock seguridad</span>
                                      <span className="font-semibold text-slate-900">
                                        {product.safetyStock}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="rounded-2xl bg-slate-50 px-4 py-3">
                                    <div className="flex items-center justify-between text-slate-600">
                                      <span>Total proyectado</span>
                                      <span className="font-semibold text-slate-900">
                                        {totalProjected}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm lg:col-span-3">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="text-sm font-semibold text-slate-900">
                                      Gráfico de Área
                                    </p>
                                    <p className="mt-1 text-xs text-slate-500">
                                      Ventas reales vs proyección por mes
                                    </p>
                                  </div>
                                </div>
                                <div className="mt-5 overflow-x-auto">
                                  <div className="min-w-[700px] h-[290px]">
                                    <ResponsiveContainer
                                      width="100%"
                                      height="100%"
                                    >
                                      <AreaChart
                                        data={product.projectedSales.map(
                                          (proj) => ({
                                            month: proj.month,
                                            projected: proj.quantity,
                                            actual: proj.actual ?? 0,
                                          }),
                                        )}
                                        margin={{
                                          top: 10,
                                          right: 16,
                                          left: 0,
                                          bottom: 0,
                                        }}
                                      >
                                        <defs>
                                          <linearGradient
                                            id="colorProjected"
                                            x1="0"
                                            y1="0"
                                            x2="0"
                                            y2="1"
                                          >
                                            <stop
                                              offset="5%"
                                              stopColor="#4f46e5"
                                              stopOpacity={0.45}
                                            />
                                            <stop
                                              offset="95%"
                                              stopColor="#4f46e5"
                                              stopOpacity={0.05}
                                            />
                                          </linearGradient>
                                          <linearGradient
                                            id="colorActual"
                                            x1="0"
                                            y1="0"
                                            x2="0"
                                            y2="1"
                                          >
                                            <stop
                                              offset="5%"
                                              stopColor="#059669"
                                              stopOpacity={0.45}
                                            />
                                            <stop
                                              offset="95%"
                                              stopColor="#059669"
                                              stopOpacity={0.05}
                                            />
                                          </linearGradient>
                                        </defs>
                                        <CartesianGrid
                                          stroke="#e2e8f0"
                                          strokeDasharray="3 3"
                                        />
                                        <XAxis
                                          dataKey="month"
                                          tick={{
                                            fontSize: 12,
                                            fill: "#475569",
                                          }}
                                        />
                                        <YAxis
                                          tick={{
                                            fontSize: 12,
                                            fill: "#475569",
                                          }}
                                        />
                                        <Tooltip
                                          contentStyle={{
                                            borderRadius: 12,
                                            border: "1px solid #e2e8f0",
                                          }}
                                        />
                                        <Legend
                                          wrapperStyle={{ paddingTop: 8 }}
                                        />
                                        <Area
                                          type="monotone"
                                          dataKey="projected"
                                          stroke="#4338ca"
                                          fillOpacity={1}
                                          fill="url(#colorProjected)"
                                          name="Proyección"
                                          strokeWidth={2}
                                        />
                                        <Area
                                          type="monotone"
                                          dataKey="actual"
                                          stroke="#059669"
                                          fillOpacity={1}
                                          fill="url(#colorActual)"
                                          name="Real"
                                          strokeWidth={2}
                                        />
                                      </AreaChart>
                                    </ResponsiveContainer>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
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
