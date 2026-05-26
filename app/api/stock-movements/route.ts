import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

const userId = "1";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const branchId = url.searchParams.get("branchId");

    const where: any = {
      userId,
      type: "OUT",
      productId: {
        not: null,
      },
    };

    if (branchId) {
      where.branchId = branchId;
    }

    const stockMovements = await prisma.stockMovement.findMany({
      where,
      include: {
        product: true,
        branch: true,
      },
      orderBy: {
        movementDate: "desc",
      },
    });

    return NextResponse.json(stockMovements);
  } catch (error) {
    console.error("GET /stock-movements error:", error);
    return NextResponse.json(
      { error: "Error al obtener movimientos de stock" },
      { status: 500 },
    );
  }
}
