"use client";

import { useEffect, useState } from "react";

type Material = {
  id: string;
  name: string;
};

type RecipeItem = {
  materialId: string;
  quantity: string;
};

type Product = {
  id: string;
  name: string;
  code: string | null;
  unit: string;
  safetyStock: number;
};

type ProductWithRecipes = Product & {
  recipes: { materialId: string; quantity: number }[];
};

export default function ProductsPage() {
  const [products, setProducts] = useState<ProductWithRecipes[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);

  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [unit, setUnit] = useState("");
  const [safetyStock, setSafetyStock] = useState("");

  const [recipes, setRecipes] = useState<RecipeItem[]>([]);

  const [editingId, setEditingId] = useState<string | null>(null);
  // FETCH
  // =============================
  const fetchProducts = async () => {
    const res = await fetch("/api/products");
    const data = await res.json();
    setProducts(data);
  };

  const fetchMaterials = async () => {
    const res = await fetch("/api/materials");
    const data = await res.json();
    setMaterials(data);
  };

  useEffect(() => {
    const load = async () => {
      await fetchProducts();
      await fetchMaterials();
    };
    load();
  }, []);
  // =============================
  // RECIPES LOGIC
  // =============================
  const addRecipe = () => {
    setRecipes([...recipes, { materialId: "", quantity: "" }]);
  };

  const updateRecipe = (index: number, field: string, value: string) => {
    const updated = [...recipes];
    updated[index] = { ...updated[index], [field]: value };
    setRecipes(updated);
  };

  const removeRecipe = (index: number) => {
    setRecipes(recipes.filter((_, i) => i !== index));
  };

  // =============================
  // SAVE
  // =============================
  const saveProduct = async () => {
    const url = editingId
      ? `/api/products/${editingId}`
      : "/api/products";

    const method = editingId ? "PUT" : "POST";

    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        code,
        unit,
        safetyStock,
        recipes,
      }),
    });

    resetForm();
    fetchProducts();
  };

  const startEdit = (p: ProductWithRecipes) => {
    setEditingId(p.id);
    setName(p.name);
    setCode(p.code || "");
    setUnit(p.unit);
    setSafetyStock(p.safetyStock.toString());

    // 🔥 cargar recetas existentes
    if (p.recipes) {
      setRecipes(
        p.recipes.map((r: { materialId: string; quantity: number }) => ({
          materialId: r.materialId,
          quantity: r.quantity.toString(),
        }))
      );
    }
  };

  const deleteProduct = async (id: string) => {
    await fetch(`/api/products/${id}`, {
      method: "DELETE",
    });

    fetchProducts();
  };

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setCode("");
    setUnit("");
    setSafetyStock("");
    setRecipes([]);
  };

  // =============================
  // UI
  // =============================
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Productos</h1>

        {/* FORM */}
        <div className="bg-white p-6 rounded-lg shadow mb-8 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <input
              className="border p-2 bg-white text-gray-900 placeholder-gray-400 rounded"
              placeholder="Nombre"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <input
              className="border p-2 bg-white text-gray-900 placeholder-gray-400 rounded"
              placeholder="Código"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
            <input
              className="border p-2 bg-white text-gray-900 placeholder-gray-400 rounded"
              placeholder="Unidad"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
            />
            <input
              className="border p-2 bg-white text-gray-900 placeholder-gray-400 rounded"
              placeholder="Stock Seguridad"
              value={safetyStock}
              onChange={(e) => setSafetyStock(e.target.value)}
            />
          </div>

          {/* RECIPES */}
          <div>
            <h2 className="font-semibold text-gray-700 mb-2">
              Receta (Materiales)
            </h2>

            <div className="space-y-2">
              {recipes.map((r, index) => (
                <div key={index} className="flex gap-2">
                  <select
                    className="border border-gray-300 p-2 rounded-md w-1/2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={r.materialId}
                    onChange={(e) =>
                      updateRecipe(index, "materialId", e.target.value)
                    }
                  >
                    <option value="">Seleccionar material</option>
                    {materials.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>

                  <input
                    className="border border-gray-300 p-2 rounded-md w-1/4 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Cantidad"
                    value={r.quantity}
                    onChange={(e) =>
                      updateRecipe(index, "quantity", e.target.value)
                    }
                  />

                  <button
                    className="bg-red-500 text-white px-3 rounded"
                    onClick={() => removeRecipe(index)}
                  >
                    X
                  </button>
                </div>
              ))}
            </div>

            <button
              className="mt-3 bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1.5 rounded-md border border-gray-300 transition"
              onClick={addRecipe}
            >
              + Agregar material
            </button>
          </div>

          <button
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded"
            onClick={saveProduct}
          >
            {editingId ? "Actualizar Producto" : "Crear Producto"}
          </button>

          {editingId && (
            <button
              className="ml-2 bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded"
              onClick={resetForm}
            >
              Cancelar
            </button>
          )}
        </div>

        {/* TABLE */}
        <div className="bg-white p-6 rounded-lg shadow">
          <table className="w-full text-sm text-gray-800">
            <thead>
              <tr className="text-left border-b border-gray-200 text-gray-600">
                <th className="py-2">Nombre</th>
                <th className="py-2">Código</th>
                <th className="py-2">Unidad</th>
                <th className="py-2">Stock</th>
                <th className="py-2">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p: ProductWithRecipes) => (
                <tr
                  key={p.id}
                  className="border-b border-gray-100 hover:bg-gray-50 transition"
                >
                  <td className="py-2">{p.name}</td>
                  <td className="py-2">{p.code}</td>
                  <td className="py-2">{p.unit}</td>
                  <td className="py-2 font-medium">{p.safetyStock}</td>

                  <td className="py-2 flex gap-2">
                    <button
                      onClick={() => startEdit(p)}
                      className="text-blue-600 hover:underline text-sm"
                    >
                      Editar
                    </button>

                    <button
                      onClick={() => deleteProduct(p.id)}
                      className="text-red-600 hover:underline text-sm"
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
