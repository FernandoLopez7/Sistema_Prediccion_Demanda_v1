"use client";

import { useEffect, useState } from "react";
import Modal from "../../../components/Modal";

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
          <table className="w-full text-sm text-gray-800">
            <thead>
              <tr className="text-left border-b border-gray-200 text-gray-600">
                <th className="py-2">Nombre</th>
                <th className="py-2">Código</th>
                <th className="py-2">Unidad</th>
                <th className="py-2">Stock</th>
                <th className="py-2">Bodega</th>
                <th className="py-2">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {materials.map((m) => (
                <tr
                  key={m.id}
                  className="border-b border-gray-100 hover:bg-gray-50 transition"
                >
                  <td className="py-2">{m.name}</td>
                  <td className="py-2">{m.code}</td>
                  <td className="py-2">{m.unit}</td>
                  <td className="py-2 font-medium">{m.stock}</td>
                  <td className="py-2">{m.warehouse}</td>

                  <td className="py-2 flex gap-2">
                    <button
                      onClick={() => startEdit(m)}
                      className="text-indigo-600 hover:underline"
                    >
                      Editar
                    </button>

                    <button
                      onClick={() => deleteMaterial(m.id)}
                      className="text-red-600 hover:underline"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
