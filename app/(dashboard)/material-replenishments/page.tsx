"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ClockIcon } from "@heroicons/react/24/outline";

type Material = {
  id: string;
  name: string;
  code: string | null;
  stock: number;
  unit: {
    name: string;
  };
  branch: {
    name: string;
  };
};

type Branch = {
  id: string;
  name: string;
};

type ReplenishItem = {
  materialId: string;
  quantity: string;
};

export default function MaterialReplenishmentsPage() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [bulkReplenishItems, setBulkReplenishItems] = useState<ReplenishItem[]>(
    [{ materialId: "", quantity: "" }],
  );
  const [bulkReplenishBranchId, setBulkReplenishBranchId] = useState("");
  const [bulkReplenishDate, setBulkReplenishDate] = useState("");

  // =============================
  // FETCH
  // =============================
  const fetchMaterials = async () => {
    const res = await fetch("/api/materials");
    const data = await res.json();
    setMaterials(data);
  };

  const fetchBranches = async () => {
    const res = await fetch("/api/branches");
    const data = await res.json();
    setBranches(data);
  };

  useEffect(() => {
    fetchMaterials();
    fetchBranches();
  }, []);

  // =============================
  // FUNCTIONS
  // =============================
  const updateBulkReplenishItem = (
    index: number,
    field: "materialId" | "quantity",
    value: string,
  ) => {
    const updated = [...bulkReplenishItems];
    updated[index] = { ...updated[index], [field]: value };
    setBulkReplenishItems(updated);
  };

  const addBulkReplenishRow = () => {
    setBulkReplenishItems([
      ...bulkReplenishItems,
      { materialId: "", quantity: "" },
    ]);
  };

  const removeBulkReplenishRow = (index: number) => {
    setBulkReplenishItems(bulkReplenishItems.filter((_, idx) => idx !== index));
  };

  const saveBulkReplenishMaterials = async () => {
    const items = bulkReplenishItems
      .map((item) => ({
        materialId: item.materialId,
        quantity: Number(item.quantity),
      }))
      .filter((item) => item.materialId && item.quantity > 0);

    if (!items.length || !bulkReplenishBranchId) {
      return;
    }

    await fetch("/api/materials/replenish-bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items,
        branchId: bulkReplenishBranchId,
        movementDate: bulkReplenishDate || undefined,
      }),
    });

    setBulkReplenishItems([{ materialId: "", quantity: "" }]);
    setBulkReplenishBranchId("");
    setBulkReplenishDate("");
    fetchMaterials();
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
                  Reabastecimiento Masivo de Materiales
                </h1>
                <p className="text-gray-600">
                  Agrega múltiples materiales para reabastecer el inventario de
                  forma masiva.
                </p>
              </div>
              <Link
                href="/material-replenishment-history"
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
                  value={bulkReplenishBranchId}
                  onChange={(e) => setBulkReplenishBranchId(e.target.value)}
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
                  value={bulkReplenishDate}
                  onChange={(e) => setBulkReplenishDate(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">
                  Materiales a reabastecer
                </h3>
                <button
                  onClick={addBulkReplenishRow}
                  type="button"
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition"
                >
                  + Agregar material
                </button>
              </div>

              {bulkReplenishItems.map((item, index) => (
                <div
                  key={`${item.materialId}-${index}`}
                  className="flex flex-col gap-4 p-4 border border-gray-200 rounded-lg bg-gray-50"
                >
                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-700 mb-1.5">
                      Material
                    </label>
                    <select
                      className="px-3 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900"
                      value={item.materialId}
                      onChange={(e) =>
                        updateBulkReplenishItem(
                          index,
                          "materialId",
                          e.target.value,
                        )
                      }
                    >
                      <option value="">Seleccionar material</option>
                      {materials.map((material) => (
                        <option key={material.id} value={material.id}>
                          {material.name}
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
                      min="0"
                      className="px-3 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900"
                      value={item.quantity}
                      onChange={(e) =>
                        updateBulkReplenishItem(
                          index,
                          "quantity",
                          e.target.value,
                        )
                      }
                    />
                  </div>

                  <button
                    onClick={() => removeBulkReplenishRow(index)}
                    className="inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 hover:border-red-300 transition-colors duration-200 self-start"
                    type="button"
                  >
                    Eliminar
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-3 pt-6 border-t border-gray-200">
              <button
                onClick={saveBulkReplenishMaterials}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-lg font-medium transition"
              >
                Reabastecer materiales
              </button>
              <button
                onClick={() => {
                  setBulkReplenishItems([{ materialId: "", quantity: "" }]);
                  setBulkReplenishBranchId("");
                  setBulkReplenishDate("");
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
