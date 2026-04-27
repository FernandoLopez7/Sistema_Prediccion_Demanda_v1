import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

const userId = "1";

type RefillItem = {
  productId: string;
  quantity: number | string;
};

export async function POST(req: Request) {
  try {
    const { items, branchId, movementDate } = await req.json();

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "items son requeridos" },
        { status: 400 },
      );
    }

    const validItems = items
      .map((item: RefillItem) => ({
        productId: item.productId,
        quantity: Number(item.quantity),
      }))
      .filter((item) => item.productId && item.quantity > 0);

    if (validItems.length === 0) {
      return NextResponse.json(
        { error: "Debe enviar al menos un producto con cantidad mayor a 0" },
        { status: 400 },
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      const processed = [] as Array<{
        productId: string;
        previousStock: number;
        newStock: number;
      }>;

      for (const item of validItems) {
        const product = await tx.product.findFirst({
          where: { id: item.productId, userId },
        });

        if (!product) {
          throw new Error(`Producto ${item.productId} no encontrado`);
        }

        const previousStock = product.stock;
        const newStock = previousStock + item.quantity;

        await tx.product.update({
          where: { id: item.productId },
          data: { stock: newStock },
        });

        await tx.stockMovement.create({
          data: {
            product: { connect: { id: item.productId } },
            user: { connect: { id: userId } },
            branch: branchId ? { connect: { id: branchId } } : undefined,
            quantity: item.quantity,
            type: "IN",
            previousStock,
            newStock,
            movementDate: movementDate ? new Date(movementDate) : new Date(),
          },
        });

        processed.push({ productId: item.productId, previousStock, newStock });
      }

      return processed;
    });

    return NextResponse.json({ ok: true, processed: result });
  } catch (error: any) {
    console.error("BULK PRODUCT REPLENISH error:", error);
    return NextResponse.json(
      {
        error: error.message || "Error en reabastecimiento masivo de productos",
      },
      { status: 500 },
    );
  }
}
