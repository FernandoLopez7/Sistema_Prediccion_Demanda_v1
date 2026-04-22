"use client";

import { useEffect, useState } from "react";

type Sale = {
  id: string;
  quantity: number;
  saleDate: string;
  product: { name: string };
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
};

export default function SalesPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [preview, setPreview] = useState<PreviewItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  const fetchAll = async () => {
    const [s, p] = await Promise.all([
      fetch("/api/sales"),
      fetch("/api/products"),
    ]);

    const salesData: Sale[] = await s.json();
    const productsData: Product[] = await p.json();

    setSales(salesData);
    setProducts(productsData);
  };

  useEffect(() => {
    const load = async () => {
      await fetchAll();
    };
    load();
  }, []);

  // ✅ SUBIR XML (TIPADO CORRECTO)
  const handleUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
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
      matched: true,
    };

    setPreview(updated);
  };

  // ✅ CONFIRMAR
  const confirmSales = async () => {
    const validItems = preview.filter(
      (p) => p.matchedProductId !== null
    );

    await fetch("/api/sales/confirm", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(validItems),
    });

    setPreview([]);
    fetchAll();
  };

  // ✅ ELIMINAR
  const remove = async (id: string) => {
    await fetch(`/api/sales/${id}`, { method: "DELETE" });
    fetchAll();
  };

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-2xl font-bold">Ventas</h1>

      {/* 🔥 SUBIR XML */}
      <div>
        <input type="file" accept=".xml" onChange={handleUpload} />
      </div>

      {/* 🔥 PREVIEW */}
      {preview.length > 0 && (
        <div>
          <h2 className="font-bold mb-2">Preview XML</h2>

          <table className="w-full border mb-4">
            <thead>
              <tr>
                <th>XML</th>
                <th>Cantidad</th>
                <th>Match</th>
              </tr>
            </thead>
            <tbody>
              {preview.map((p: PreviewItem, i: number) => (
                <tr key={i}>
                  <td>{p.productName}</td>
                  <td>{p.quantity}</td>
                  <td>
                    {p.matched ? (
                      <span className="text-green-600">✔</span>
                    ) : (
                      <select
                        value={p.matchedProductId || ""}
                        onChange={(e) =>
                          updateMatch(i, e.target.value)
                        }
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

          <button
            className="bg-black text-white px-4 py-2"
            onClick={confirmSales}
          >
            Confirmar ventas
          </button>
        </div>
      )}

      {/* 📊 TABLA REAL */}
      <table className="w-full border">
        <thead>
          <tr>
            <th>Producto</th>
            <th>Cantidad</th>
            <th>Fecha</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {sales.map((s: Sale) => (
            <tr key={s.id}>
              <td>{s.product.name}</td>
              <td>{s.quantity}</td>
              <td>{new Date(s.saleDate).toLocaleDateString()}</td>
              <td>
                <button
                  className="text-red-500"
                  onClick={() => remove(s.id)}
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