"use client";

import { useEffect, useState } from "react";
import Modal from "../../../components/Modal";

type Sale = {
  id: string;
  quantity: number;
  saleDate: string;
  product: { name: string };
  branch: { name: string };
};

type PreviewItem = {
  productName: string;
  quantity: number;
  matched: boolean;
  matchedProductId: string | null;
};

type Product = {
  id: string;
  name: string;
  stock: number;
  branchId: string;
};

type Branch = {
  id: string;
  name: string;
};

export default function SalesPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [preview, setPreview] = useState<PreviewItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [selectedBranchId, setSelectedBranchId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [saleDate, setSaleDate] = useState(
    new Date().toISOString().split("T")[0],
  );

  const fetchAll = async () => {
    const [s, p, b] = await Promise.all([
      fetch("/api/sales"),
      fetch("/api/products"),
      fetch("/api/branches"),
    ]);

    const salesData: Sale[] = await s.json();
    const productsData: Product[] = await p.json();
    const branchesData: Branch[] = await b.json();

    setSales(salesData);
    setProducts(productsData);
    setBranches(branchesData);
  };

  useEffect(() => {
    const load = async () => {
      await fetchAll();
    };
    load();
  }, []);

  // ✅ SUBIR XML (TIPADO CORRECTO)
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/sales/upload", {
      method: "POST",
      body: formData,
    });

    const data: PreviewItem[] = await res.json();
    setPreview(data);
  };

  // ✅ EDITAR MATCH
  const updateMatch = (index: number, productId: string) => {
    const updated: PreviewItem[] = [...preview];

    updated[index] = {
      ...updated[index],
      matchedProductId: productId,
      matched: !!productId,
    };

    setPreview(updated);
  };

  // ✅ CONFIRMAR
  const confirmSales = async () => {
    const validItems = preview.filter((p) => p.matchedProductId !== null);

    if (validItems.length === 0) {
      alert("No hay ventas válidas para confirmar");
      return;
    }

    for (const item of validItems) {
      const product = products.find((p) => p.id === item.matchedProductId);

      if (!product) {
        alert(`Producto no encontrado para: ${item.productName}`);
        return;
      }

      if (Number(item.quantity) > product.stock) {
        alert(
          `Stock insuficiente para ${product.name}. Disponible: ${product.stock}`,
        );
        return;
      }
    }

    const payload = validItems.map((item) => {
      const product = products.find((p) => p.id === item.matchedProductId);

      return {
        ...item,
        branchId: product?.branchId ?? "",
      };
    });

    const res = await fetch("/api/sales/confirm", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json();
      alert(err.error || "Error al confirmar ventas");
      return;
    }

    setPreview([]);
    fetchAll();
  };

  // ✅ ELIMINAR
  const remove = async (id: string) => {
    await fetch(`/api/sales/${id}`, { method: "DELETE" });
    fetchAll();
  };

  // ✅ CREAR VENTA MANUAL
  const saveManualSale = async () => {
    if (!selectedProductId || !selectedBranchId || !quantity) {
      alert("Por favor completa todos los campos");
      return;
    }

    const product = products.find((p) => p.id === selectedProductId);

    if (!product) {
      alert("Producto no encontrado");
      return;
    }

    const qty = Number(quantity);

    if (!Number.isFinite(qty) || qty <= 0) {
      alert("La cantidad debe ser mayor a 0");
      return;
    }

    if (qty > product.stock) {
      alert(`Stock insuficiente. Disponible: ${product.stock}`);
      return;
    }

    const res = await fetch("/api/sales", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId: selectedProductId,
        branchId: selectedBranchId,
        quantity: qty,
        saleDate,
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      alert(err.error || "Error al crear venta");
      return;
    }

    resetManualForm();
    fetchAll();
  };

  const resetManualForm = () => {
    setSelectedProductId("");
    setSelectedBranchId("");
    setQuantity("");
    setSaleDate(new Date().toISOString().split("T")[0]);
    setIsModalOpen(false);
  };

  return (
    <div className="p-6 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Ventas</h1>
        <button
          onClick={() => {
            resetManualForm();
            setIsModalOpen(true);
          }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md font-medium"
        >
          + Crear Venta Manual
        </button>
      </div>

      {/* MODAL CREAR VENTA MANUAL */}
      <Modal
        isOpen={isModalOpen}
        title="Crear Venta Manual"
        onClose={resetManualForm}
      >
        <div className="space-y-5">
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1.5">
              Producto
            </label>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="px-3 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            >
              <option value="">Seleccionar producto</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1.5">
              Sucursal
            </label>
            <select
              value={selectedBranchId}
              onChange={(e) => setSelectedBranchId(e.target.value)}
              className="px-3 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            >
              <option value="">Seleccionar sucursal</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
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
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="Ingresa la cantidad"
              className="px-3 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1.5">
              Fecha de Venta
            </label>
            <input
              type="date"
              value={saleDate}
              onChange={(e) => setSaleDate(e.target.value)}
              className="px-3 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            />
          </div>

          <div className="flex gap-3 pt-6 border-t border-gray-200">
            <button
              onClick={saveManualSale}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg font-medium transition"
            >
              Crear Venta
            </button>
            <button
              onClick={resetManualForm}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2.5 rounded-lg font-medium transition"
            >
              Cancelar
            </button>
          </div>
        </div>
      </Modal>

      {/* SUBIR XML */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="font-bold mb-4 text-gray-900">
          Importar Ventas desde XML
        </h2>
        <input type="file" accept=".xml" onChange={handleUpload} />
      </div>

      {/* 🔥 PREVIEW */}
      {preview.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="font-bold mb-4">Preview XML</h2>

          <div className="overflow-auto mb-4">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Producto (XML)
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Cantidad
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Asignar a Producto
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {preview.map((p: PreviewItem, i: number) => (
                  <tr key={i} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {p.productName}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {p.quantity}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {p.matched ? (
                        <span className="inline-flex items-center gap-1 text-green-600 font-medium bg-green-50 px-3 py-1 rounded-full">
                          <span>✔</span> Asignado
                        </span>
                      ) : (
                        <select
                          value={p.matchedProductId || ""}
                          onChange={(e) => updateMatch(i, e.target.value)}
                          className="border border-gray-300 p-2 rounded-lg bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          <option value="">Seleccionar</option>
                          {products.map((prod: Product) => (
                            <option key={prod.id} value={prod.id}>
                              {prod.name}
                            </option>
                          ))}
                        </select>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded font-medium"
            onClick={confirmSales}
          >
            Confirmar Ventas
          </button>
        </div>
      )}

      {/* 📊 TABLA REAL */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Ventas Registradas
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  Producto
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  Sucursal
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  Cantidad
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  Fecha
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sales.map((s: Sale) => (
                <tr key={s.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {s.product.name}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {s.branch?.name}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {s.quantity}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {new Date(s.saleDate).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <button
                      className="text-red-600 hover:text-red-800 hover:bg-red-50 px-3 py-1.5 rounded-md font-medium transition"
                      onClick={() => remove(s.id)}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {sales.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p className="text-sm">No hay ventas registradas</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}