"use client";

import { useEffect, useState } from "react";
import Modal from "../../../components/Modal";

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
  stock: number; // 👈 agregar
};

type ProductWithRecipes = Product & {
  recipes: { materialId: string; quantity: number }[];
};

export default function ProductsPage() {
  const [products, setProducts] = useState<ProductWithRecipes[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [unit, setUnit] = useState("");
  const [safetyStock, setSafetyStock] = useState("");
  const [stock, setStock] = useState("");

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
    const url = editingId ? `/api/products/${editingId}` : "/api/products";

    const method = editingId ? "PUT" : "POST";

    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        code,
        unit,
        safetyStock,
        stock, // 👈
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
    setStock(p.stock?.toString() ?? "0"); // 👈 FALTABA

    // 🔥 cargar recetas existentes
    if (p.recipes) {
      setRecipes(
        p.recipes.map((r: { materialId: string; quantity: number }) => ({
          materialId: r.materialId,
          quantity: r.quantity.toString(),
        })),
      );
    }

    setIsModalOpen(true);
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
    setStock(""); // 👈 FALTABA
    setRecipes([]);
    setIsModalOpen(false);
  };

  // =============================
  // UI
  // =============================
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Productos</h1>
          <button
            onClick={() => {
              resetForm();
              setIsModalOpen(true);
            }}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md font-medium"
          >
            + Agregar Producto
          </button>
        </div>

        {/* MODAL */}
        <Modal
          isOpen={isModalOpen}
          title={editingId ? "Editar Producto" : "Crear Producto"}
          onClose={resetForm}
        >
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-1.5">
                  Nombre
                </label>
                <input
                  className="px-3 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  placeholder="Nombre del producto"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-1.5">
                  Código
                </label>
                <input
                  className="px-3 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  placeholder="Código del producto"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                />
              </div>
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-1.5">
                  Unidad
                </label>
                <input
                  className="px-3 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  placeholder="Unidad de medida"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                />
              </div>
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-1.5">
                  Stock Seguridad
                </label>
                <input
                  className="px-3 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  placeholder="Cantidad de seguridad"
                  value={safetyStock}
                  onChange={(e) => setSafetyStock(e.target.value)}
                />
              </div>
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-1.5">
                  Stock
                </label>
                <input
                  className="px-3 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  placeholder="Cantidad actual en stock"
                  value={stock}
                  onChange={(e) => setSafetyStock(e.target.value)}
                />
              </div>
            </div>

            {/* RECIPES */}
            <div className="border-t border-gray-200 pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-900">
                  Receta (Materiales)
                </h3>
              </div>

              <div className="space-y-3">
                {recipes.map((r, index) => (
                  <div key={index} className="flex gap-2 items-end">
                    <div className="flex-1">
                      <label className="text-xs font-medium text-gray-600 mb-1 block">
                        Material
                      </label>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition text-sm"
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
                    </div>

                    <div className="w-24">
                      <label className="text-xs font-medium text-gray-600 mb-1 block">
                        Cantidad
                      </label>
                      <input
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition text-sm"
                        placeholder="Cant."
                        value={r.quantity}
                        onChange={(e) =>
                          updateRecipe(index, "quantity", e.target.value)
                        }
                      />
                    </div>

                    <button
                      className="bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 p-2.5 rounded-lg transition font-semibold"
                      onClick={() => removeRecipe(index)}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>

              <button
                className="mt-4 w-full py-2.5 px-3 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg font-medium transition text-sm"
                onClick={addRecipe}
              >
                + Agregar material
              </button>
            </div>

            <div className="flex gap-3 pt-2 border-t border-gray-200">
              <button
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg font-medium transition"
                onClick={saveProduct}
              >
                {editingId ? "Actualizar Producto" : "Crear Producto"}
              </button>

              <button
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2.5 rounded-lg font-medium transition"
                onClick={resetForm}
              >
                Cancelar
              </button>
            </div>
          </div>
        </Modal>

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
                  <td className="py-2 font-medium">{p.stock}</td>

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
                    <button
                      onClick={async () => {
                        const qty = prompt("Cantidad a agregar");
                        if (!qty) return;

                        await fetch("/api/products/add-stock", {
                          method: "POST",
                          headers: {
                            "Content-Type": "application/json",
                          },
                          body: JSON.stringify({
                            productId: p.id,
                            quantity: Number(qty),
                          }),
                        });

                        fetchProducts();
                      }}
                      className="text-green-600 hover:underline text-sm"
                    >
                      + Stock
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
