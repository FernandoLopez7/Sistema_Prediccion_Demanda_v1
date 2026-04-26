"use client";

import { useEffect, useState } from "react";
import Modal from "../../../components/Modal";

type Material = {
  id: string;
  name: string;
};

type Unit = {
  id: string;
  name: string;
};

type Branch = {
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

  unit: { name: string };
  branch: { name: string };

  unitId: string;
  branchId: string;

  safetyStock: number;
  stock: number;
};

type ProductWithRecipes = Product & {
  recipes: { materialId: string; quantity: number }[];
};

export default function ProductsPage() {
  const [products, setProducts] = useState<ProductWithRecipes[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [name, setName] = useState("");
  const [code, setCode] = useState("");

  const [unitId, setUnitId] = useState("");
  const [branchId, setBranchId] = useState("");

  const [safetyStock, setSafetyStock] = useState("");
  const [stock, setStock] = useState("");

  const [recipes, setRecipes] = useState<RecipeItem[]>([]);

  const [editingId, setEditingId] = useState<string | null>(null);

  // =============================
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

  const fetchUnits = async () => {
    const res = await fetch("/api/units");
    const data = await res.json();
    setUnits(data);
  };

  const fetchBranches = async () => {
    const res = await fetch("/api/branches");
    const data = await res.json();
    setBranches(data);
  };

  useEffect(() => {
    const load = async () => {
      await Promise.all([
        fetchProducts(),
        fetchMaterials(),
        fetchUnits(),
        fetchBranches(),
      ]);
    };
    load();
  }, []);

  // =============================
  // RECIPES
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
        unitId,
        branchId,
        safetyStock,
        stock,
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

    setUnitId(p.unitId);
    setBranchId(p.branchId);

    setSafetyStock(p.safetyStock.toString());
    setStock(p.stock?.toString() ?? "0");

    if (p.recipes) {
      setRecipes(
        p.recipes.map((r) => ({
          materialId: r.materialId,
          quantity: r.quantity.toString(),
        }))
      );
    }

    setIsModalOpen(true);
  };

  const deleteProduct = async (id: string) => {
    await fetch(`/api/products/${id}`, { method: "DELETE" });
    fetchProducts();
  };

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setCode("");
    setUnitId("");
    setBranchId("");
    setSafetyStock("");
    setStock("");
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

              {/* INPUTS NORMALES */}
              <Input label="Nombre" value={name} set={setName} placeholder="Nombre del producto" />
              <Input label="Código" value={code} set={setCode} placeholder="Código del producto" />

              {/* SELECT UNIDAD */}
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-1.5">
                  Unidad
                </label>
                <select
                  value={unitId}
                  onChange={(e) => setUnitId(e.target.value)}
                  className="px-3 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900"
                >
                  <option value="">Seleccionar</option>
                  {units.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* SELECT SUCURSAL */}
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-1.5">
                  Sucursal
                </label>
                <select
                  value={branchId}
                  onChange={(e) => setBranchId(e.target.value)}
                  className="px-3 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900"
                >
                  <option value="">Seleccionar</option>
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              <Input label="Stock Seguridad" value={safetyStock} set={setSafetyStock} placeholder="Cantidad de seguridad" />
              <Input label="Stock" value={stock} set={setStock} placeholder="Cantidad actual en stock" />

            </div>

            {/* RECIPES (SIN CAMBIOS DE DISEÑO) */}
            <div className="border-t border-gray-200 pt-6">
              <div className="space-y-3">
                {recipes.map((r, index) => (
                  <div key={index} className="flex gap-2 items-end">
                    <div className="flex-1">
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900"
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
                      <input
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white"
                        placeholder="Cant."
                        value={r.quantity}
                        onChange={(e) =>
                          updateRecipe(index, "quantity", e.target.value)
                        }
                      />
                    </div>

                    <button
                      className="bg-red-50 text-red-600 p-2.5 rounded-lg"
                      onClick={() => removeRecipe(index)}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>

              <button
                className="mt-4 w-full py-2.5 px-3 border border-gray-300 text-gray-700 rounded-lg"
                onClick={addRecipe}
              >
                + Agregar material
              </button>
            </div>

            <div className="flex gap-3">
              <button
                className="flex-1 bg-indigo-600 text-white px-4 py-2.5 rounded-lg"
                onClick={saveProduct}
              >
                {editingId ? "Actualizar Producto" : "Crear Producto"}
              </button>

              <button
                className="flex-1 bg-gray-100 text-gray-700 px-4 py-2.5 rounded-lg"
                onClick={resetForm}
              >
                Cancelar
              </button>
            </div>
          </div>
        </Modal>

        {/* TABLE ORIGINAL SIN CAMBIOS */}
        <div className="bg-white p-6 rounded-lg shadow">
          <table className="w-full text-sm text-gray-800">
            <thead>
              <tr className="text-left border-b border-gray-200 text-gray-600">
                <th className="py-2">Nombre</th>
                <th className="py-2">Código</th>
                <th className="py-2">Unidad</th>
                <th className="py-2">Safety Stock</th>
                <th className="py-2">Stock</th>
                <th className="py-2">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                  <td className="py-2">{p.name}</td>
                  <td className="py-2">{p.code}</td>
                  <td className="py-2">{p.unit?.name}</td>
                  <td className="py-2 font-medium">{p.safetyStock}</td>
                  <td className="py-2 font-medium">{p.stock}</td>

                  <td className="py-2 flex gap-2">
                    <button onClick={() => startEdit(p)} className="text-blue-600 hover:underline text-sm">
                      Editar
                    </button>

                    <button onClick={() => deleteProduct(p.id)} className="text-red-600 hover:underline text-sm">
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

function Input({ label, value, set, placeholder }: any) {
  return (
    <div className="flex flex-col">
      <label className="text-sm font-medium text-gray-700 mb-1.5">
        {label}
      </label>
      <input
        className="px-3 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900"
        placeholder={placeholder}
        value={value}
        onChange={(e) => set(e.target.value)}
      />
    </div>
  );
}