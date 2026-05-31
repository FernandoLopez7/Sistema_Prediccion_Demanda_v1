"use client";

import { useEffect, useMemo, useState } from "react";

// Obtener fecha local en formato YYYY-MM-DD sin conversión a UTC
const getLocalDateString = (date: Date = new Date()): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

type Material = {
  id: string;
  name: string;
  stock: number;
  reorderPoint?: number | null;
  branch?: { id: string; name: string } | null;
};

type Branch = {
  id: string;
  name: string;
};

export default function MaterialReplenishmentsPage() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedMaterialId, setSelectedMaterialId] = useState<string>("");
  const [branchId, setBranchId] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(0);
  const [movementDate, setMovementDate] =
    useState<string>(getLocalDateString());
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string>("");
  const [error, setError] = useState<string>("");

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (!selectedMaterialId && materials.length > 0) {
      setSelectedMaterialId(materials[0].id);
    }
  }, [materials, selectedMaterialId]);

  useEffect(() => {
    if (!branchId && branches.length > 0) {
      setBranchId(branches[0].id);
    }
  }, [branches, branchId]);

  const selectedMaterial = useMemo(
    () =>
      materials.find((material) => material.id === selectedMaterialId) ??
      materials[0],
    [materials, selectedMaterialId],
  );

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const [materialsRes, branchesRes] = await Promise.all([
        fetch("/api/materials"),
        fetch("/api/branches"),
      ]);

      if (!materialsRes.ok || !branchesRes.ok) {
        throw new Error("Error al cargar materiales o sucursales");
      }

      const materialsData = await materialsRes.json();
      const branchesData = await branchesRes.json();

      setMaterials(materialsData ?? []);
      setBranches(branchesData ?? []);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setError(message || "No se pudieron cargar los datos");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!selectedMaterialId) {
      setError("Selecciona un material para reabastecer.");
      return;
    }

    if (quantity <= 0) {
      setError("La cantidad debe ser mayor a cero.");
      return;
    }

    if (!branchId) {
      setError("Selecciona una sucursal.");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/materials/add-stock", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          materialId: selectedMaterialId,
          quantity,
          branchId,
          movementDate,
        }),
      });

      const body = await res.json();
      if (!res.ok) {
        throw new Error(body.error || "Error en el reabastecimiento");
      }

      setMessage("Material reabastecido correctamente.");
      setQuantity(0);
      await fetchData();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setError(message || "Error en el reabastecimiento");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="bg-white rounded-3xl shadow-sm p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Reabastecimiento de Materiales
              </h1>
              <p className="mt-2 text-gray-600">
                Visualiza tus materiales y agrega stock con movimiento de
                entrada.
              </p>
            </div>
            <button
              type="button"
              onClick={fetchData}
              className="inline-flex items-center justify-center rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
            >
              Actualizar datos
            </button>
          </div>

          {loading ? (
            <div className="mt-10 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
          ) : (
            <div className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_0.9fr]">
              <div className="overflow-x-auto rounded-3xl border border-gray-200 bg-white p-4 shadow-sm">
                <table className="min-w-full text-left text-sm text-gray-700">
                  <thead className="border-b border-gray-200 text-sm font-semibold uppercase text-gray-500">
                    <tr>
                      <th className="px-4 py-3">Material</th>
                      <th className="px-4 py-3">Sucursal</th>
                      <th className="px-4 py-3">Stock</th>
                      <th className="px-4 py-3">Punto de pedido</th>
                      <th className="px-4 py-3">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {materials.map((material) => (
                      <tr key={material.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-900">
                          {material.name}
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {material.branch?.name ?? "-"}
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {material.stock}
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {material.reorderPoint ?? 0}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            type="button"
                            onClick={() => setSelectedMaterialId(material.id)}
                            className={`rounded-full px-3 py-1 text-sm font-semibold ${selectedMaterialId === material.id ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                          >
                            Seleccionar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="rounded-3xl border border-gray-200 bg-gray-50 p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-gray-900">
                  Formulario de reabastecimiento
                </h2>
                <p className="mt-2 text-sm text-gray-600">
                  Elige material, cantidad y sucursal para generar un movimiento
                  IN.
                </p>

                <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Material seleccionado
                    </label>
                    <div className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-gray-900">
                      {selectedMaterial ? (
                        <div className="font-semibold">
                          {selectedMaterial.name}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">
                          Selecciona un material en la tabla.
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="branch"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Sucursal
                    </label>
                    <select
                      id="branch"
                      value={branchId}
                      onChange={(e) => setBranchId(e.target.value)}
                      className="mt-2 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                    >
                      <option value="">Selecciona sucursal</option>
                      {branches.map((branch) => (
                        <option key={branch.id} value={branch.id}>
                          {branch.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="quantity"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Cantidad
                    </label>
                    <input
                      id="quantity"
                      type="number"
                      min={1}
                      value={quantity}
                      onChange={(e) => setQuantity(Number(e.target.value))}
                      className="mt-2 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="movementDate"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Fecha de movimiento
                    </label>
                    <input
                      id="movementDate"
                      type="date"
                      value={movementDate}
                      onChange={(e) => setMovementDate(e.target.value)}
                      className="mt-2 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                    />
                  </div>

                  {error && <p className="text-sm text-red-600">{error}</p>}
                  {message && (
                    <p className="text-sm text-emerald-600">{message}</p>
                  )}

                  <button
                    type="submit"
                    disabled={submitting || !selectedMaterialId}
                    className="w-full rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {submitting ? "Procesando..." : "Reabastecer material"}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
