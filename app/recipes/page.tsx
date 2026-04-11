"use client";

import { useEffect, useState } from "react";

type Product = {
  id: string;
  name: string;
};

type Material = {
  id: string;
  name: string;
};

type Recipe = {
  id: string;
  quantity: number;
  product: Product;
  material: Material;
};

export default function RecipesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);

  const [productId, setProductId] = useState("");
  const [materialId, setMaterialId] = useState("");
  const [quantity, setQuantity] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchAll = async () => {
    const [r, p, m] = await Promise.all([
      fetch("/api/recipes"),
      fetch("/api/products"),
      fetch("/api/materials"),
    ]);

    setRecipes(await r.json());
    setProducts(await p.json());
    setMaterials(await m.json());
  };

  useEffect(() => {
    const load = async () => {
      await fetchAll();
    };
    load();
  }, []);

  const save = async () => {
    const url = editingId ? `/api/recipes/${editingId}` : "/api/recipes";
    const method = editingId ? "PUT" : "POST";

    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId,
        materialId,
        quantity,
      }),
    });

    resetForm();
    fetchAll();
  };

  const remove = async (id: string) => {
    await fetch(`/api/recipes/${id}`, { method: "DELETE" });
    fetchAll();
  };

  const startEdit = (r: Recipe) => {
    setEditingId(r.id);
    setProductId(r.product.id);
    setMaterialId(r.material.id);
    setQuantity(r.quantity.toString());
  };

  const resetForm = () => {
    setEditingId(null);
    setProductId("");
    setMaterialId("");
    setQuantity("");
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Recetas</h1>

      <div className="flex gap-2 mb-6">
        <select value={productId} onChange={(e) => setProductId(e.target.value)}>
          <option value="">Producto</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>

        <select value={materialId} onChange={(e) => setMaterialId(e.target.value)}>
          <option value="">Material</option>
          {materials.map((m) => (
            <option key={m.id} value={m.id}>{m.name}</option>
          ))}
        </select>

        <input
          className="border p-2"
          placeholder="Cantidad"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
        />

        <button className="bg-black text-white px-4" onClick={save}>
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
            <th>Producto</th>
            <th>Material</th>
            <th>Cantidad</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {recipes.map((r) => (
            <tr key={r.id}>
              <td>{r.product.name}</td>
              <td>{r.material.name}</td>
              <td>{r.quantity}</td>
              <td>
                <button className="text-blue-500 mr-2" onClick={() => startEdit(r)}>
                  Editar
                </button>
                <button className="text-red-500" onClick={() => remove(r.id)}>
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