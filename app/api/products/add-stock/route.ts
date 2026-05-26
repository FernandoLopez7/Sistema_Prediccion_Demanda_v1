import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

const userId = "1"; // luego session

export async function POST(req: Request) {
  try {
    const { productId, quantity, branchId, movementDate } = await req.json();

    // 🔴 validaciones
    if (!productId || !quantity) {
      return NextResponse.json(
        { error: "productId y quantity son requeridos" },
        { status: 400 },
      );
    }

    const qty = Number(quantity);

    if (qty <= 0) {
      return NextResponse.json(
        { error: "La cantidad debe ser mayor a 0" },
        { status: 400 },
      );
    }

    // 🔍 verificar producto
    const product = await prisma.product.findFirst({
      where: {
        id: productId,
        userId,
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Producto no encontrado" },
        { status: 404 },
      );
    }

    // ✅ TRANSACCIÓN
    const result = await prisma.$transaction(async (tx) => {
      const previousStock = product.stock;
      const newStock = previousStock + qty;

      // 1. actualizar stock
      const updatedProduct = await tx.product.update({
        where: { id: productId },
        data: {
          stock: newStock,
        },
      });

      // 2. guardar historial completo
      await tx.stockMovement.create({
        data: {
          product: { connect: { id: productId } },
          user: { connect: { id: userId } },
          branch: branchId ? { connect: { id: branchId } } : undefined,
          quantity: qty,
          type: "IN",
          previousStock,
          newStock,
          movementDate: movementDate ? new Date(movementDate) : undefined,
        },
      });

      return updatedProduct;
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("ADD STOCK error:", error);
    return NextResponse.json(
      { error: "Error al agregar stock" },
      { status: 500 },
    );
  }
}
