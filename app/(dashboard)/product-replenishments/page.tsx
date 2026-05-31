"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ClockIcon } from "@heroicons/react/24/outline";

type Product = {
  id: string;
  name: string;
  code: string | null;
  stock: number;
  safetyStock: number;
  unit: {
    name: string;
  };
  branch: {
    id?: string;
    name: string;
  };
};

type Branch = {
  id: string;
  name: string;
};

type ReplenishItem = {
  productId: string;
  quantity: string;
};

export default function ProductReplenishmentsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [bulkStockItems, setBulkStockItems] = useState<ReplenishItem[]>([
    { productId: "", quantity: "" },
  ]);
  const [bulkStockBranchId, setBulkStockBranchId] = useState("");
  const [bulkStockDate, setBulkStockDate] = useState("");

  // =============================
  // FETCH
  // =============================
  const fetchProducts = async () => {
    const res = await fetch("/api/products");
    const data = await res.json();
    const sorted = Array.isArray(data)
      ? data.slice().sort((a, b) => a.name.localeCompare(b.name))
      : [];
    setProducts(sorted);
  };

  const fetchBranches = async () => {
    const res = await fetch("/api/branches");
    const data = await res.json();
    setBranches(data);
  };

  useEffect(() => {
    (async () => {
      await fetchProducts();
      await fetchBranches();
    })();
  }, []);

  // When branch changes, clear any selected products that don't belong to it
  useEffect(() => {
    if (!bulkStockBranchId) return;

    // defer update to avoid synchronous setState within effect
    const t = window.setTimeout(() => {
      setBulkStockItems((prev) =>
        prev.map((item) => {
          if (!item.productId) return item;
          const p = products.find((prod) => prod.id === item.productId);
          if (!p) return { ...item, productId: "" };
          if (p.branch?.id && p.branch.id !== bulkStockBranchId) {
            return { ...item, productId: "" };
          }
          return item;
        }),
      );
    }, 0);

    return () => window.clearTimeout(t);
  }, [bulkStockBranchId, products]);

  // =============================
  // FUNCTIONS
  // =============================
  const updateBulkStockItem = (
    index: number,
    field: "productId" | "quantity",
    value: string,
  ) => {
    const updated = [...bulkStockItems];
    updated[index] = { ...updated[index], [field]: value };
    setBulkStockItems(updated);
  };

  const addBulkStockRow = () => {
    setBulkStockItems([...bulkStockItems, { productId: "", quantity: "" }]);
  };

  const removeBulkStockItem = (index: number) => {
    setBulkStockItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  const saveBulkStock = async () => {
    const items = bulkStockItems
      .map((item) => ({
        productId: item.productId,
        quantity: Number(item.quantity),
      }))
      .filter((item) => item.productId && item.quantity > 0);

    if (!items.length) {
      return;
    }

    await fetch("/api/products/replenish-bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items,
        branchId: bulkStockBranchId || undefined,
        movementDate: bulkStockDate || undefined,
      }),
    });

    setBulkStockItems([{ productId: "", quantity: "" }]);
    setBulkStockBranchId("");
    setBulkStockDate("");
    fetchProducts();
  };

  // =============================
  // UI
  // =============================
  return (
    <div className="min-h-screen bg-gray-50 p-6 pt-24">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white p-8 rounded-lg shadow">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Reabastecimiento Masivo de Productos
                </h1>
                <p className="text-gray-600">
                  Agrega múltiples productos para reabastecer el inventario de
                  forma masiva.
                </p>
              </div>
              <Link
                href="/product-replenishment-history"
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 hover:border-blue-300 transition-colors duration-200"
              >
                <ClockIcon className="w-4 h-4" />
                Historial
              </Link>
            </div>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-1.5">
                  Sucursal
                </label>
                <select
                  className="px-3 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900"
                  value={bulkStockBranchId}
                  onChange={(e) => setBulkStockBranchId(e.target.value)}
                >
                  <option value="">Seleccionar sucursal</option>
                  {branches.map((branch) => (
                    <option key={branch.id} value={branch.id}>
                      {branch.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-1.5">
                  Fecha de movimiento
                </label>
                <input
                  type="date"
                  className="px-3 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900"
                  value={bulkStockDate}
                  onChange={(e) => setBulkStockDate(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">
                  Productos a reabastecer
                </h3>
                <button
                  onClick={addBulkStockRow}
                  type="button"
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition"
                >
                  + Agregar producto
                </button>
              </div>

              {bulkStockItems.map((item, index) => {
                const filteredProducts = bulkStockBranchId
                  ? products.filter((p) => p.branch?.id === bulkStockBranchId)
                  : products;

                const noBranchSelected = !bulkStockBranchId;

                return (
                  <div
                    key={`${item.productId}-${index}`}
                    className="p-4 border border-gray-200 rounded-lg bg-gray-50"
                  >
                    {/* Producto: ocupando toda la linea */}
                    <div className="flex flex-col">
                      <label className="text-sm font-medium text-gray-700 mb-1.5">
                        Producto
                      </label>
                      <select
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900"
                        value={item.productId}
                        onChange={(e) =>
                          updateBulkStockItem(
                            index,
                            "productId",
                            e.target.value,
                          )
                        }
                        disabled={noBranchSelected}
                      >
                        <option value="">
                          {noBranchSelected
                            ? "Seleccionar sucursal primero"
                            : "Seleccionar producto"}
                        </option>
                        {filteredProducts.map((product) => (
                          <option key={product.id} value={product.id}>
                            {product.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Cantidad + eliminar en una fila separada */}
                    <div className="flex gap-4 mt-3 items-end">
                      <div className="flex-1">
                        <label className="text-sm font-medium text-gray-700 mb-1.5">
                          Cantidad
                        </label>
                        <input
                          type="number"
                          min="0"
                          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900"
                          value={item.quantity}
                          onChange={(e) =>
                            updateBulkStockItem(
                              index,
                              "quantity",
                              e.target.value,
                            )
                          }
                        />
                      </div>

                      <div className="w-32">
                        <button
                          onClick={() => removeBulkStockItem(index)}
                          className="w-full px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex gap-3 pt-6 border-t border-gray-200">
              <button
                onClick={saveBulkStock}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-lg font-medium transition"
              >
                Reabastecer productos
              </button>
              <button
                onClick={() => {
                  setBulkStockItems([{ productId: "", quantity: "" }]);
                  setBulkStockBranchId("");
                  setBulkStockDate("");
                }}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2.5 rounded-lg font-medium transition"
              >
                Limpiar formulario
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
