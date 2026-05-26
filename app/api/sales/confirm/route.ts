import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

const userId = "1";

type ConfirmItem = {
  matchedProductId: string | null;
  quantity: number;
  xmlFilename?: string;
  branchId: string; // 👈 NUEVO
};

export async function POST(req: Request) {
  try {
    const items: ConfirmItem[] = await req.json();

    if (!Array.isArray(items)) {
      return NextResponse.json({ error: "Formato inválido" }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      let count = 0;

      for (const item of items) {
        if (!item.matchedProductId) continue;

        if (!item.branchId) {
          throw new Error("branchId requerido");
        }

        const product = await tx.product.findFirst({
          where: {
            id: item.matchedProductId,
            userId,
          },
        });

        if (!product) {
          throw new Error("Producto no encontrado");
        }

        const qty = Number(item.quantity);

        if (qty <= 0) {
          throw new Error("Cantidad inválida");
        }

        // 🔴 VALIDAR STOCK
        if (product.stock < qty) {
          throw new Error(
            `Stock insuficiente para ${product.name}. Disponible: ${product.stock}`,
          );
        }

        const newStock = product.stock - qty;

        // ✅ actualizar stock
        await tx.product.update({
          where: { id: product.id },
          data: { stock: newStock },
        });

        // ✅ crear venta
        await tx.sale.create({
          data: {
            userId,
            branchId: item.branchId, // 👈 FIX
            productId: product.id,
            quantity: qty,
            saleDate: new Date(),
            xmlFilename: item.xmlFilename || null,
          },
        });

        // (opcional recomendado)
        await tx.stockMovement.create({
          data: {
            productId: product.id,
            userId,
            branchId: item.branchId,
            quantity: qty,
            type: "OUT",
            previousStock: product.stock,
            newStock,
            movementDate: new Date(),
          },
        });

        count++;
      }

      return { count };
    });

    return NextResponse.json({ ok: true, count: result.count });
  } catch (error: any) {
    console.error("CONFIRM ERROR:", error);

    return NextResponse.json(
      { error: error.message || "Error al guardar ventas" },
      { status: 500 },
    );
  }
}
