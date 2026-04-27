"use client";

import { useEffect, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  SortingState,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

type StockMovement = {
  id: string;
  type: string;
  quantity: number;
  movementDate: string;
  notes: string | null;
  material: {
    id: string;
    name: string;
    code: string | null;
  } | null;
  branch: {
    id: string;
    name: string;
  } | null;
};

const columnHelper = createColumnHelper<StockMovement>();

export default function MaterialReplenishmentHistoryPage() {
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  // =============================
  // FETCH
  // =============================
  const fetchMovements = async () => {
    try {
      const res = await fetch("/api/stock-movements?entity=material&type=IN");
      const data = await res.json();

      if (!res.ok) {
        console.error("GET /api/stock-movements failed", data);
        setMovements([]);
        return;
      }

      setMovements(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching movements:", error);
      setMovements([]);
    }
  };

  useEffect(() => {
    fetchMovements();
  }, []);

  // =============================
  // TABLE
  // =============================
  const columns = [
    columnHelper.accessor("material.name", {
      header: "Material",
      cell: (info) => (
        <div>
          <div className="font-medium text-gray-900">{info.getValue()}</div>
          {info.row.original.material?.code && (
            <div className="text-sm text-gray-500">
              Código: {info.row.original.material.code}
            </div>
          )}
        </div>
      ),
    }),
    columnHelper.accessor("quantity", {
      header: "Cantidad",
      cell: (info) => (
        <span className="font-medium text-green-600">+{info.getValue()}</span>
      ),
    }),
    columnHelper.accessor("branch.name", {
      header: "Sucursal",
      cell: (info) => info.getValue() || "N/A",
    }),
    columnHelper.accessor("movementDate", {
      header: "Fecha",
      cell: (info) => {
        const date = new Date(info.getValue());
        return date.toLocaleDateString("es-ES", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
      },
    }),
    columnHelper.accessor("notes", {
      header: "Notas",
      cell: (info) => (
        <span className="text-gray-600">{info.getValue() || "Sin notas"}</span>
      ),
    }),
  ];

  const table = useReactTable({
    data: movements,
    columns,
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    globalFilterFn: (row, _columnId, filterValue) => {
      const value = String(filterValue).toLowerCase();
      const materialName = row.original.material?.name?.toLowerCase() || "";
      const materialCode = row.original.material?.code?.toLowerCase() || "";
      const branchName = row.original.branch?.name?.toLowerCase() || "";
      const notes = row.original.notes?.toLowerCase() || "";

      return (
        materialName.includes(value) ||
        materialCode.includes(value) ||
        branchName.includes(value) ||
        notes.includes(value)
      );
    },
  });

  // =============================
  // UI
  // =============================
  return (
    <div className="min-h-screen bg-gray-50 p-6 pt-24">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Link
            href="/material-replenishments"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Volver a Reabastecimientos
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">
            Historial de Reabastecimientos - Materiales
          </h1>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-lg font-medium text-gray-900">
                  Movimientos de Entrada
                </h2>
                <p className="text-sm text-gray-600">
                  Historial completo de reabastecimientos de materiales
                </p>
              </div>

              <div className="relative">
                <svg
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
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
                  placeholder="Buscar por material, código, sucursal o notas..."
                  value={globalFilter}
                  onChange={(e) => setGlobalFilter(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-gray-800">
              <thead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr
                    key={headerGroup.id}
                    className="text-left border-b border-gray-200 text-gray-600"
                  >
                    {headerGroup.headers.map((header) => (
                      <th key={header.id} className="py-3 px-6">
                        {header.isPlaceholder ? null : (
                          <button
                            type="button"
                            onClick={header.column.getToggleSortingHandler()}
                            className="inline-flex items-center bg-transparent gap-1 text-left text-gray-700 hover:text-gray-900"
                          >
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                            {{
                              asc: "▲",
                              desc: "▼",
                            }[header.column.getIsSorted() as string] ?? null}
                          </button>
                        )}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={columns.length}
                      className="py-8 text-center text-gray-500"
                    >
                      No hay movimientos de reabastecimiento registrados
                    </td>
                  </tr>
                ) : (
                  table.getRowModel().rows.map((row) => (
                    <tr
                      key={row.id}
                      className="border-b border-gray-100 hover:bg-gray-50 transition"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="py-3 px-6 align-top">
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          {table.getPageCount() > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
              <div className="text-sm text-gray-700">
                Mostrando{" "}
                {table.getState().pagination.pageIndex *
                  table.getState().pagination.pageSize +
                  1}{" "}
                a{" "}
                {table.getState().pagination.pageIndex *
                  table.getState().pagination.pageSize +
                  table.getRowModel().rows.length}{" "}
                de {table.getFilteredRowModel().rows.length} movimientos
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-gray-300 transition-colors duration-200"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                  Anterior
                </button>

                <span className="text-sm text-gray-700">
                  Página {table.getState().pagination.pageIndex + 1} de{" "}
                  {table.getPageCount()}
                </span>

                <button
                  type="button"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-gray-300 transition-colors duration-200"
                >
                  Siguiente
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
