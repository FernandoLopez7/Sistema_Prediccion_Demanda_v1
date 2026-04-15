"use client";

import { useEffect, useState } from "react";

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

  const fetchMaterials = async () => {
    try {
      const res = await fetch("/api/materials");
      const data = await res.json();
      console.log("FETCH materials:", data);
      setMaterials(data);
    } catch (error) {
      console.error("Error fetching materials:", error);
    }
  };

  

    useEffect(() => {
    const load = async () => {
      await fetchMaterials();
    };
    load();
  }, []);


  const saveMaterial = async () => {
    try {
      const url = editingId
        ? `/api/materials/${editingId}`
        : "/api/materials";
      const method = editingId ? "PUT" : "POST";

      const payload = {
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
      };

      console.log("SAVE payload:", payload);

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      console.log("SAVE response:", data);

      resetForm();
      fetchMaterials();
    } catch (error) {
      console.error("Error saving material:", error);
    }
  };

  const deleteMaterial = async (id: string) => {
    try {
      console.log("DELETE id:", id);

      await fetch(`/api/materials/${id}`, {
        method: "DELETE",
      });

      fetchMaterials();
    } catch (error) {
      console.error("Error deleting material:", error);
    }
  };

  const startEdit = (m: Material) => {
    console.log("EDIT material:", m);

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
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Materiales</h1>

      {/* FORM */}
      <div className="grid grid-cols-4 gap-2 mb-6">
        <input className="border p-2" placeholder="Nombre" value={name} onChange={(e) => setName(e.target.value)} />
        <input className="border p-2" placeholder="Código" value={code} onChange={(e) => setCode(e.target.value)} />
        <input className="border p-2" placeholder="Unidad" value={unit} onChange={(e) => setUnit(e.target.value)} />
        <input className="border p-2" placeholder="Stock" value={stock} onChange={(e) => setStock(e.target.value)} />

        <input className="border p-2" placeholder="Anterior" value={previous} onChange={(e) => setPrevious(e.target.value)} />
        <input className="border p-2" placeholder="Entradas" value={entries} onChange={(e) => setEntries(e.target.value)} />
        <input className="border p-2" placeholder="Salidas" value={exits} onChange={(e) => setExits(e.target.value)} />
        <input className="border p-2" placeholder="Promedio" value={average} onChange={(e) => setAverage(e.target.value)} />

        <input className="border p-2" placeholder="Precio Unitario" value={unitPrice} onChange={(e) => setUnitPrice(e.target.value)} />
        <input className="border p-2" placeholder="Bodega" value={warehouse} onChange={(e) => setWarehouse(e.target.value)} />
        <input className="border p-2" placeholder="Punto Reorden" value={reorderPoint} onChange={(e) => setReorderPoint(e.target.value)} />

        <button className="bg-black text-white px-4 col-span-1" onClick={saveMaterial}>
          {editingId ? "Actualizar" : "Crear"}
        </button>

        {editingId && (
          <button className="border px-4 col-span-1" onClick={resetForm}>
            Cancelar
          </button>
        )}
      </div>

      {/* TABLE */}
      <table className="w-full border text-sm">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Código</th>
            <th>Unidad</th>
            <th>Stock</th>
            <th>Anterior</th>
            <th>Entradas</th>
            <th>Salidas</th>
            <th>Promedio</th>
            <th>Precio</th>
            <th>Bodega</th>
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
              <td>{m.previous}</td>
              <td>{m.entries}</td>
              <td>{m.exits}</td>
              <td>{m.average}</td>
              <td>{m.unitPrice}</td>
              <td>{m.warehouse}</td>
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