import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

const userId = "1";

export async function POST(req: Request) {
  try {
    const { materialId, quantity, branchId, movementDate } = await req.json();

    if (!materialId || !quantity || !branchId) {
      return NextResponse.json(
        { error: "materialId, quantity y branchId son requeridos" },
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

    const material = await prisma.material.findFirst({
      where: { id: materialId, userId },
    });

    if (!material) {
      return NextResponse.json(
        { error: "Material no encontrado" },
        { status: 404 },
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      const previousStock = material.stock;
      const newStock = previousStock + qty;

      await tx.material.update({
        where: { id: materialId },
        data: { stock: newStock },
      });

      await tx.stockMovement.create({
        data: {
          material: { connect: { id: materialId } },
          user: { connect: { id: userId } },
          branch: { connect: { id: branchId } },
          quantity: qty,
          type: "IN",
          previousStock,
          newStock,
          movementDate: movementDate ? new Date(movementDate) : new Date(),
        },
      });

      return { materialId, previousStock, newStock };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("ADD MATERIAL STOCK error:", error);
    return NextResponse.json(
      { error: "Error al reabastecer material" },
      { status: 500 },
    );
  }
}
