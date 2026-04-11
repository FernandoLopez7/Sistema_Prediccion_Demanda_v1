"use client";

import { useEffect, useState } from "react";

type Material = {
  id: string;
  name: string;
  code: string | null;
  unit: string;
  stock: number;
  reorderPoint: number | null;
};

export default function MaterialsPage() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [unit, setUnit] = useState("");
  const [stock, setStock] = useState("");
  const [reorderPoint, setReorderPoint] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

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
        reorderPoint
      }),
    });

    resetForm();
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
    setReorderPoint(m.reorderPoint?.toString() || "");
  };

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setCode("");
    setUnit("");
    setStock("");
    setReorderPoint("");
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Materiales</h1>

      <div className="flex gap-2 mb-6">
        <input className="border p-2" placeholder="Nombre" value={name} onChange={(e) => setName(e.target.value)} />
        <input className="border p-2" placeholder="Código" value={code} onChange={(e) => setCode(e.target.value)} />
        <input className="border p-2" placeholder="Unidad" value={unit} onChange={(e) => setUnit(e.target.value)} />
        <input className="border p-2" placeholder="Stock" value={stock} onChange={(e) => setStock(e.target.value)} />
        <input className="border p-2" placeholder="Punto Reorden" value={reorderPoint} onChange={(e) => setReorderPoint(e.target.value)} />

        <button className="bg-black text-white px-4" onClick={saveMaterial}>
          {editingId ? "Actualizar" : "Crear"}
        </button>

        {editingId && (
          <button className="border px-4" onClick={resetForm}>
            Cancelar
          </button>
        )}
      </div>

      <table className="w-full border">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Código</th>
            <th>Unidad</th>
            <th>Stock</th>
            <th>Reorden</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {materials.map((m) => (
            <tr key={m.id}>
              <td>{m.name}</td>
              <td>{m.code}</td>
              <td>{m.unit}</td>
              <td>{m.stock}</td>
              <td>{m.reorderPoint}</td>
              <td>
                <button className="text-blue-500 mr-2" onClick={() => startEdit(m)}>
                  Editar
                </button>
                <button className="text-red-500" onClick={() => deleteMaterial(m.id)}>
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}