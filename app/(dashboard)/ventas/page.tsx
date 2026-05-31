"use client";

import { useEffect, useState } from "react";
import Modal from "../../../components/Modal";

type Sale = {
  id: string;
  quantity: number;
  movementDate: string;
  product: { name: string };
  branch: { id: string; name: string };
};

type PreviewItem = {
  productName: string;
  quantity: number;
  matched: boolean;
  matchedProductId: string | null;
};

type Product = {
  id: string;
  name: string;
  stock: number;
  branchId: string;
};

type Branch = {
  id: string;
  name: string;
};

export default function SalesPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [preview, setPreview] = useState<PreviewItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [selectedBranchId, setSelectedBranchId] = useState("");
  const [branchFilter, setBranchFilter] = useState("");
  const [yearFilter, setYearFilter] = useState("");
  const [monthFilter, setMonthFilter] = useState("");
  const [quantity, setQuantity] = useState("");
  const [saleDate, setSaleDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"product" | "date" | "quantity">("date");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  const fetchAll = async () => {
    const [s, p, b] = await Promise.all([
      fetch("/api/stock-movements"),
      fetch("/api/products"),
      fetch("/api/branches"),
    ]);

    const salesData: Sale[] = await s.json();
    const productsData: Product[] = await p.json();
    const branchesData: Branch[] = await b.json();

    setSales(salesData);
    setProducts(productsData);
    setBranches(branchesData);
  };

  useEffect(() => {
    const load = async () => {
      await fetchAll();
    };
    load();
  }, []);

  const sortedProducts = [...products].sort((a, b) =>
    a.name.localeCompare(b.name),
  );

  const filteredProductsByBranch = selectedBranchId
    ? sortedProducts.filter((product) => product.branchId === selectedBranchId)
    : [];

  const availableYears = Array.from(
    new Set(sales.map((sale) => new Date(sale.movementDate).getFullYear())),
  ).sort((a, b) => b - a);

  const monthOptions = [
    { value: "1", label: "Enero" },
    { value: "2", label: "Febrero" },
    { value: "3", label: "Marzo" },
    { value: "4", label: "Abril" },
    { value: "5", label: "Mayo" },
    { value: "6", label: "Junio" },
    { value: "7", label: "Julio" },
    { value: "8", label: "Agosto" },
    { value: "9", label: "Septiembre" },
    { value: "10", label: "Octubre" },
    { value: "11", label: "Noviembre" },
    { value: "12", label: "Diciembre" },
  ];

  // ✅ EDITAR MATCH
  const updateMatch = (index: number, productId: string) => {
    const updated: PreviewItem[] = [...preview];

    updated[index] = {
      ...updated[index],
      matchedProductId: productId,
      matched: !!productId,
    };

    setPreview(updated);
  };

  // ✅ CONFIRMAR
  const confirmSales = async () => {
    const validItems = preview.filter((p) => p.matchedProductId !== null);

    if (validItems.length === 0) {
      alert("No hay ventas válidas para confirmar");
      return;
    }

    for (const item of validItems) {
      const product = products.find((p) => p.id === item.matchedProductId);

      if (!product) {
        alert(`Producto no encontrado para: ${item.productName}`);
        return;
      }

      if (Number(item.quantity) > product.stock) {
        alert(
          `Stock insuficiente para ${product.name}. Disponible: ${product.stock}`,
        );
        return;
      }
    }

    const payload = validItems.map((item) => {
      const product = products.find((p) => p.id === item.matchedProductId);

      return {
        ...item,
        branchId: product?.branchId ?? "",
      };
    });

    const res = await fetch("/api/sales/confirm", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json();
      alert(err.error || "Error al confirmar ventas");
      return;
    }

    setPreview([]);
    fetchAll();
  };

  // ✅ CREAR VENTA MANUAL
  const saveManualSale = async () => {
    if (!selectedProductId || !selectedBranchId || !quantity) {
      alert("Por favor completa todos los campos");
      return;
    }

    const product = products.find((p) => p.id === selectedProductId);

    if (!product) {
      alert("Producto no encontrado");
      return;
    }

    if (product.branchId !== selectedBranchId) {
      alert("El producto seleccionado no pertenece a la sucursal elegida");
      return;
    }

    const qty = Number(quantity);

    if (!Number.isFinite(qty) || qty <= 0) {
      alert("La cantidad debe ser mayor a 0");
      return;
    }

    if (qty > product.stock) {
      alert(`Stock insuficiente. Disponible: ${product.stock}`);
      return;
    }

    const res = await fetch("/api/sales", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId: selectedProductId,
        branchId: selectedBranchId,
        quantity: qty,
        saleDate,
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      alert(err.error || "Error al crear venta");
      return;
    }

    resetManualForm();
    fetchAll();
  };

  const resetManualForm = () => {
    setSelectedProductId("");
    setSelectedBranchId("");
    setQuantity("");
    setSaleDate(new Date().toISOString().split("T")[0]);
    setIsModalOpen(false);
  };

  // Filtrado y ordenamiento de ventas
  const filteredSales = sales
    .filter((sale) => {
      const saleDateObject = new Date(sale.movementDate);
      const saleYear = saleDateObject.getFullYear();
      const saleMonth = String(saleDateObject.getMonth() + 1);

      return (
        (!branchFilter || sale.branch?.id === branchFilter) &&
        (!yearFilter || String(saleYear) === yearFilter) &&
        (!monthFilter || saleMonth === monthFilter) &&
        sale.product.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    })
    .sort((a, b) => {
      if (sortBy === "product") {
        return a.product.name.localeCompare(b.product.name);
      } else if (sortBy === "quantity") {
        return b.quantity - a.quantity;
      }
      return (
        new Date(b.movementDate).getTime() - new Date(a.movementDate).getTime()
      );
    });

  const totalPages = Math.ceil(filteredSales.length / itemsPerPage);
  const paginatedSales = filteredSales.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Ventas</h1>
        <button
          onClick={() => {
            resetManualForm();
            setIsModalOpen(true);
          }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md font-medium"
        >
          + Crear Venta Manual
        </button>
      </div>

      {/* MODAL CREAR VENTA MANUAL */}
      <Modal
        isOpen={isModalOpen}
        title="Crear Venta Manual"
        onClose={resetManualForm}
      >
        <div className="space-y-5">
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1.5">
              Sucursal
            </label>
            <select
              value={selectedBranchId}
              onChange={(e) => {
                setSelectedBranchId(e.target.value);
                setSelectedProductId("");
              }}
              className="px-3 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            >
              <option value="">Seleccionar sucursal</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1.5">
              Producto
            </label>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              disabled={!selectedBranchId}
              className="px-3 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition disabled:bg-gray-100"
            >
              <option value="">
                {selectedBranchId
                  ? "Seleccionar producto"
                  : "Seleccionar sucursal primero"}
              </option>
              {filteredProductsByBranch.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1.5">
              Cantidad
            </label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="Ingresa la cantidad"
              className="px-3 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1.5">
              Fecha de Venta
            </label>
            <input
              type="date"
              value={saleDate}
              onChange={(e) => setSaleDate(e.target.value)}
              className="px-3 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            />
          </div>

          <div className="flex gap-3 pt-6 border-t border-gray-200">
            <button
              onClick={saveManualSale}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg font-medium transition"
            >
              Crear Venta
            </button>
            <button
              onClick={resetManualForm}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2.5 rounded-lg font-medium transition"
            >
              Cancelar
            </button>
          </div>
        </div>
      </Modal>

      {/* SUBIR XML 
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="font-bold mb-4 text-gray-900">
          Importar Ventas desde XML
        </h2>
        <input type="file" accept=".xml" onChange={handleUpload} />
      </div>*/}

      {/* 🔥 PREVIEW */}
      {preview.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="font-bold mb-4">Preview XML</h2>

          <div className="overflow-auto mb-4">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Producto (XML)
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Cantidad
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Asignar a Producto
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {preview.map((p: PreviewItem, i: number) => (
                  <tr key={i} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {p.productName}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {p.quantity}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {p.matched ? (
                        <span className="inline-flex items-center gap-1 text-green-600 font-medium bg-green-50 px-3 py-1 rounded-full">
                          <span>✔</span> Asignado
                        </span>
                      ) : (
                        <select
                          value={p.matchedProductId || ""}
                          onChange={(e) => updateMatch(i, e.target.value)}
                          className="border border-gray-300 p-2 rounded-lg bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          <option value="">Seleccionar</option>
                          {products.map((prod: Product) => (
                            <option key={prod.id} value={prod.id}>
                              {prod.name}
                            </option>
                          ))}
                        </select>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded font-medium"
            onClick={confirmSales}
          >
            Confirmar Ventas
          </button>
        </div>
      )}

      {/* 📊 TABLA REAL */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Ventas Registradas
        </h2>
        <div className="grid gap-3 w-full max-w-4xl mb-4 sm:grid-cols-2 xl:grid-cols-5">
          <div className="relative col-span-2">
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
              placeholder="Buscar por producto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <select
            value={branchFilter}
            onChange={(e) => {
              setBranchFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">Todas las sucursales</option>
            {branches.map((branch) => (
              <option key={branch.id} value={branch.id}>
                {branch.name}
              </option>
            ))}
          </select>

          <select
            value={yearFilter}
            onChange={(e) => {
              setYearFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">Todos los años</option>
            {availableYears.map((year) => (
              <option key={year} value={String(year)}>
                {year}
              </option>
            ))}
          </select>

          <select
            value={monthFilter}
            onChange={(e) => {
              setMonthFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">Todos los meses</option>
            {monthOptions.map((month) => (
              <option key={month.value} value={month.value}>
                {month.label}
              </option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) =>
              setSortBy(e.target.value as "product" | "date" | "quantity")
            }
            className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="date">Ordenar por: Fecha (Reciente)</option>
            <option value="product">Ordenar por: Producto</option>
            <option value="quantity">Ordenar por: Cantidad</option>
          </select>
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
                  Cantidad
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  Fecha
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedSales.map((s: Sale) => (
                <tr key={s.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {s.product.name}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {s.branch?.name}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {s.quantity}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {new Date(s.movementDate).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {paginatedSales.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p className="text-sm">
                {filteredSales.length === 0
                  ? "No hay ventas registradas"
                  : "No se encontraron resultados"}
              </p>
            </div>
          )}
        </div>

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-gray-700">
              Mostrando {(currentPage - 1) * itemsPerPage + 1} a{" "}
              {Math.min(currentPage * itemsPerPage, filteredSales.length)} de{" "}
              {filteredSales.length} ventas
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
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
                Página {currentPage} de {totalPages}
              </span>
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
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
  );
}
