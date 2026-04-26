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
import Modal from "../../../components/Modal";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";

type Material = {
  id: string;
  name: string;
  code: string | null;
  unit: string;
  stock: number;
  previous: number | null;
  entries: number | null;
  exits: number | null;
  average: number | null;
  unitPrice: number | null;
  warehouse: string | null;
  reorderPoint: number | null;
};

export default function MaterialsPage() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [unit, setUnit] = useState("");
  const [stock, setStock] = useState("");
  const [previous, setPrevious] = useState("");
  const [entries, setEntries] = useState("");
  const [exits, setExits] = useState("");
  const [average, setAverage] = useState("");
  const [unitPrice, setUnitPrice] = useState("");
  const [warehouse, setWarehouse] = useState("");
  const [reorderPoint, setReorderPoint] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);

  // Estados para búsqueda, ordenamiento y paginación con TanStack Table
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const itemsPerPage = 15;

  const columnHelper = createColumnHelper<Material>();

  const columns = [
    columnHelper.accessor("name", {
      header: () => <span>Nombre</span>,
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("code", {
      header: () => <span>Código</span>,
      cell: (info) => info.getValue() ?? "-",
    }),
    columnHelper.accessor("unit", {
      header: () => <span>Unidad</span>,
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("stock", {
      header: () => <span>Stock</span>,
      cell: (info) => (
        <span className="font-medium text-gray-900">{info.getValue()}</span>
      ),
    }),
    columnHelper.accessor("warehouse", {
      header: () => <span>Bodega</span>,
      cell: (info) => info.getValue() ?? "-",
    }),
    columnHelper.display({
      id: "acciones",
      header: () => <span>Acciones</span>,
      cell: ({ row }) => (
        <div className="flex gap-1">
          <button
            onClick={() => startEdit(row.original)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 hover:border-blue-300 transition-colors duration-200"
            title="Editar material"
          >
            <PencilIcon className="w-4 h-4" />
            Editar
          </button>

          <button
            onClick={() => deleteMaterial(row.original.id)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 hover:border-red-300 transition-colors duration-200"
            title="Eliminar material"
          >
            <TrashIcon className="w-4 h-4" />
            Eliminar
          </button>
        </div>
      ),
    }),
  ];

  const table = useReactTable({
    data: materials,
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
      return (
        String(row.getValue("name")).toLowerCase().includes(value) ||
        String(row.getValue("code") ?? "")
          .toLowerCase()
          .includes(value)
      );
    },
    initialState: {
      pagination: {
        pageSize: itemsPerPage,
      },
    },
  });

  useEffect(() => {
    table.setPageIndex(0);
  }, [globalFilter]);

  // =============================
  // FETCH
  // =============================
  const fetchMaterials = async () => {
    const res = await fetch("/api/materials");
    const data = await res.json();
    setMaterials(data);
  };

  useEffect(() => {
    const load = async () => {
      await fetchMaterials();
    };
    load();
  }, []);

  // =============================
  // SAVE
  // =============================
  const saveMaterial = async () => {
    const url = editingId ? `/api/materials/${editingId}` : "/api/materials";

    const method = editingId ? "PUT" : "POST";

    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        code,
        unit,
        stock,
        previous,
        entries,
        exits,
        average,
        unitPrice,
        warehouse,
        reorderPoint,
      }),
    });

    resetForm();
    setIsModalOpen(false);
    fetchMaterials();
  };

  const deleteMaterial = async (id: string) => {
    await fetch(`/api/materials/${id}`, { method: "DELETE" });
    fetchMaterials();
  };

  const startEdit = (m: Material) => {
    setEditingId(m.id);
    setName(m.name);
    setCode(m.code || "");
    setUnit(m.unit);
    setStock(m.stock.toString());
    setPrevious(m.previous?.toString() || "");
    setEntries(m.entries?.toString() || "");
    setExits(m.exits?.toString() || "");
    setAverage(m.average?.toString() || "");
    setUnitPrice(m.unitPrice?.toString() || "");
    setWarehouse(m.warehouse || "");
    setReorderPoint(m.reorderPoint?.toString() || "");
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setCode("");
    setUnit("");
    setStock("");
    setPrevious("");
    setEntries("");
    setExits("");
    setAverage("");
    setUnitPrice("");
    setWarehouse("");
    setReorderPoint("");
    setIsModalOpen(false);
  };

  // =============================
  // UI
  // =============================
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Materiales</h1>
          <button
            onClick={() => {
              resetForm();
              setIsModalOpen(true);
            }}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md font-medium"
          >
            + Agregar Material
          </button>
        </div>

        {/* MODAL */}
        <Modal
          isOpen={isModalOpen}
          title={editingId ? "Editar Material" : "Crear Material"}
          onClose={resetForm}
        >
          <div className="space-y-5">
            <div className="grid grid-cols-3 gap-4">
              {[
                { val: name, set: setName, ph: "Nombre" },
                { val: code, set: setCode, ph: "Código" },
                { val: unit, set: setUnit, ph: "Unidad" },
                { val: stock, set: setStock, ph: "Stock" },
                { val: previous, set: setPrevious, ph: "Anterior" },
                { val: entries, set: setEntries, ph: "Entradas" },
                { val: exits, set: setExits, ph: "Salidas" },
                { val: average, set: setAverage, ph: "Promedio" },
                { val: unitPrice, set: setUnitPrice, ph: "Precio Unitario" },
                { val: warehouse, set: setWarehouse, ph: "Bodega" },
                {
                  val: reorderPoint,
                  set: setReorderPoint,
                  ph: "Punto Reorden",
                },
              ].map((f, i) => (
                <div key={i} className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700 mb-1.5">
                    {f.ph}
                  </label>
                  <input
                    className="px-3 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                    placeholder={f.ph}
                    value={f.val}
                    onChange={(e) => f.set(e.target.value)}
                  />
                </div>
              ))}
            </div>

            <div className="flex gap-3 pt-6 border-t border-gray-200">
              <button
                onClick={saveMaterial}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg font-medium transition"
              >
                {editingId ? "Actualizar" : "Crear"}
              </button>
              <button
                onClick={resetForm}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2.5 rounded-lg font-medium transition"
              >
                Cancelar
              </button>
            </div>
          </div>
        </Modal>

        {/* TABLE */}
        <div className="bg-white p-6 rounded-lg shadow overflow-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Lista de Materiales
            </h2>
            <div className="flex gap-3 items-center w-full max-w-xl">
              <div className="relative flex-1">
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
                  placeholder="Buscar por nombre o código..."
                  value={globalFilter}
                  onChange={(e) => setGlobalFilter(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          <table className="w-full text-sm text-gray-800">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr
                  key={headerGroup.id}
                  className="text-left border-b border-gray-200 text-gray-600"
                >
                  {headerGroup.headers.map((header) => (
                    <th key={header.id} className="py-2">
                      {header.isPlaceholder ? null : (
                        <button
                          type="button"
                          onClick={header.column.getToggleSortingHandler()}
                          className="inline-flex items-center gap-1 text-left"
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
              {table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-gray-100 hover:bg-gray-50 transition"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="py-2 align-top">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          {/* Paginación */}
          {table.getPageCount() > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-700">
                Mostrando{" "}
                {table.getState().pagination.pageIndex *
                  table.getState().pagination.pageSize +
                  1}{" "}
                a{" "}
                {table.getState().pagination.pageIndex *
                  table.getState().pagination.pageSize +
                  table.getRowModel().rows.length}{" "}
                de {table.getFilteredRowModel().rows.length} materiales
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
                <span className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-lg">
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
