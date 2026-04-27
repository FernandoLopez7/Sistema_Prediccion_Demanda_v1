import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const entity = url.searchParams.get("entity");
    const type = url.searchParams.get("type");
    const productId = url.searchParams.get("productId");
    const materialId = url.searchParams.get("materialId");

    const where: any = {};

    if (entity === "product") {
      where.productId = { not: null };
    } else if (entity === "material") {
      where.materialId = { not: null };
    }

    if (type) {
      where.type = type;
    }

    if (productId) {
      where.productId = productId;
    }

    if (materialId) {
      where.materialId = materialId;
    }

    const movements = await prisma.stockMovement.findMany({
      where,
      orderBy: { movementDate: "desc" },
      include: {
        product: {
          select: { id: true, name: true, code: true },
        },
        material: {
          select: { id: true, name: true, code: true },
        },
        branch: {
          select: { id: true, name: true },
        },
      },
    });

    return NextResponse.json(movements);
  } catch (error) {
    console.error("GET /stock-movements error:", error);
    return NextResponse.json(
      { error: "Error al obtener movimientos de stock" },
      { status: 500 },
    );
  }
}
