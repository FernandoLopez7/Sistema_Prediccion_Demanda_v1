import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

const userId = "1";

export async function GET() {
  try {
    const sales = await prisma.sale.findMany({
      where: { userId },
      include: {
        product: true,
        branch: true, // 🔥 FIX IMPORTANTE
      },
      orderBy: { saleDate: "desc" },
    });

    return NextResponse.json(sales);
  } catch (error) {
    return NextResponse.json(
      { error: "Error al obtener ventas" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { productId, quantity, saleDate, branchId } = body;

    // 🔴 VALIDACIONES
    if (!productId || !quantity || !branchId) {
      return NextResponse.json(
        { error: "productId, quantity y branchId son requeridos" },
        { status: 400 },
      );
    }

    const qty = Number(quantity);

    if (qty <= 0) {
      return NextResponse.json({ error: "Cantidad inválida" }, { status: 400 });
    }

    // 🔥 TRANSACCIÓN
    const result = await prisma.$transaction(async (tx) => {
      const product = await tx.product.findFirst({
        where: {
          id: productId,
          userId,
        },
      });

      if (!product) {
        throw new Error("Producto no encontrado");
      }

      if (product.branchId !== branchId) {
        throw new Error("El producto no pertenece a la sucursal seleccionada");
      }

      // 🔴 VALIDAR STOCK
      if (product.stock < qty) {
        throw new Error(`Stock insuficiente. Disponible: ${product.stock}`);
      }

      const newStock = product.stock - qty;

      // ✅ actualizar stock
      await tx.product.update({
        where: { id: productId },
        data: { stock: newStock },
      });

      // ✅ crear venta (FIX branchId)
      const sale = await tx.sale.create({
        data: {
          userId,
          productId,
          branchId, // 👈 FIX
          quantity: qty,
          saleDate: saleDate ? new Date(saleDate) : new Date(),
        },
      });

      // (opcional pero recomendado)
      await tx.stockMovement.create({
        data: {
          productId,
          userId,
          branchId,
          quantity: qty,
          type: "OUT",
          previousStock: product.stock,
          newStock,
          movementDate: saleDate ? new Date(saleDate) : new Date(),
        },
      });

      return sale;
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("POST /sales error:", error);

    return NextResponse.json(
      { error: error.message || "Error al crear venta" },
      { status: 500 },
    );
  }
}
