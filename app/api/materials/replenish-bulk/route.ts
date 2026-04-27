import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

const userId = "1";

type RefillItem = {
  materialId: string;
  quantity: number | string;
};

export async function POST(req: Request) {
  try {
    const { items, branchId, movementDate } = await req.json();

    if (!Array.isArray(items) || items.length === 0 || !branchId) {
      return NextResponse.json(
        { error: "items y branchId son requeridos" },
        { status: 400 },
      );
    }

    const validItems = items
      .map((item: RefillItem) => ({
        materialId: item.materialId,
        quantity: Number(item.quantity),
      }))
      .filter((item) => item.materialId && item.quantity > 0);

    if (validItems.length === 0) {
      return NextResponse.json(
        { error: "Debe enviar al menos un material con cantidad mayor a 0" },
        { status: 400 },
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      const processed = [] as Array<{
        materialId: string;
        previousStock: number;
        newStock: number;
      }>;

      for (const item of validItems) {
        const material = await tx.material.findFirst({
          where: { id: item.materialId, userId },
        });

        if (!material) {
          throw new Error(`Material ${item.materialId} no encontrado`);
        }

        const previousStock = material.stock;
        const newStock = previousStock + item.quantity;

        await tx.material.update({
          where: { id: item.materialId },
          data: { stock: newStock },
        });

        await tx.stockMovement.create({
          data: {
            material: { connect: { id: item.materialId } },
            user: { connect: { id: userId } },
            branch: { connect: { id: branchId } },
            quantity: item.quantity,
            type: "IN",
            previousStock,
            newStock,
            movementDate: movementDate ? new Date(movementDate) : new Date(),
          },
        });

        processed.push({
          materialId: item.materialId,
          previousStock,
          newStock,
        });
      }

      return processed;
    });

    return NextResponse.json({ ok: true, processed: result });
  } catch (error: any) {
    console.error("BULK MATERIAL REPLENISH error:", error);
    return NextResponse.json(
      { error: error.message || "Error en reabastecimiento masivo" },
      { status: 500 },
    );
  }
}
