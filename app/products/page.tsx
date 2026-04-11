"use client";

import { useEffect, useState } from "react";

type Product = {
  id: string;
  name: string;
  code: string | null;
  unit: string;
  safetyStock: number;
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [unit, setUnit] = useState("");
  const [safetyStock, setSafetyStock] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchProducts = async () => {
    const res = await fetch("/api/products");
    const data = await res.json();
    setProducts(data);
  };

  useEffect(() => {
    const load = async () => {
      await fetchProducts();
    };
    load();
  }, []);

  const saveProduct = async () => {
    const url = editingId ? `/api/products/${editingId}` : "/api/products";
    const method = editingId ? "PUT" : "POST";

    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, code, unit, safetyStock }),
    });

    resetForm();
    fetchProducts();
  };

  const deleteProduct = async (id: string) => {
    await fetch(`/api/products/${id}`, { method: "DELETE" });
    fetchProducts();
  };

  const startEdit = (p: Product) => {
    setEditingId(p.id);
    setName(p.name);
    setCode(p.code || "");
    setUnit(p.unit);
    setSafetyStock(p.safetyStock.toString());
  };

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setCode("");
    setUnit("");
    setSafetyStock("");
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Productos</h1>

      <div className="flex gap-2 mb-6">
        <input
          className="border p-2"
          placeholder="Nombre"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          className="border p-2"
          placeholder="Código"
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
        <input
          className="border p-2"
          placeholder="Unidad"
          value={unit}
          onChange={(e) => setUnit(e.target.value)}
        />
        <input
          className="border p-2"
          placeholder="Stock Seguridad"
          value={safetyStock}
          onChange={(e) => setSafetyStock(e.target.value)}
        />

        <button className="bg-black text-white px-4" onClick={saveProduct}>
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
            <th></th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id}>
              <td>{p.name}</td>
              <td>{p.code}</td>
              <td>{p.unit}</td>
              <td>{p.safetyStock}</td>
              <td>
                <button
                  className="text-blue-500 mr-2"
                  onClick={() => startEdit(p)}
                >
                  Editar
                </button>
                <button
                  className="text-red-500"
                  onClick={() => deleteProduct(p.id)}
                >
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
