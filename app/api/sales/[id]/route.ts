import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

function getId(req: Request) {
  return new URL(req.url).pathname.split("/").pop();
}

export async function DELETE(req: Request) {
  try {
    const id = getId(req);

    if (!id) {
      return NextResponse.json({ error: "ID requerido" }, { status: 400 });
    }

    await prisma.$transaction(async (tx) => {
      const sale = await tx.sale.findUnique({
        where: { id },
      });

      if (!sale) {
        throw new Error("Venta no encontrada");
      }

      const product = await tx.product.findUnique({
        where: { id: sale.productId },
      });

      if (!product) {
        throw new Error("Producto asociado a la venta no encontrado");
      }

      const restoredStock = product.stock + sale.quantity;

      await tx.product.update({
        where: { id: product.id },
        data: { stock: restoredStock },
      });

      const matchingMovement = await tx.stockMovement.findFirst({
        where: {
          productId: sale.productId,
          branchId: sale.branchId,
          quantity: sale.quantity,
          type: "OUT",
          movementDate: sale.saleDate,
        },
        orderBy: { createdAt: "desc" },
      });

      if (matchingMovement) {
        await tx.stockMovement.delete({
          where: { id: matchingMovement.id },
        });
      }

      await tx.sale.delete({
        where: { id },
      });
    });

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error("DELETE /sales/[id] error:", error);
    return NextResponse.json(
      { error: error.message || "Error al eliminar venta" },
      { status: 500 },
    );
  }
}
