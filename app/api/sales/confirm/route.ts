import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

const userId = "1";

type ConfirmItem = {
  matchedProductId: string | null;
  quantity: number;
  xmlFilename?: string;
};

export async function POST(req: Request) {
  try {
    const items: ConfirmItem[] = await req.json(); // ✅ SOLO UNA VEZ

    if (!Array.isArray(items)) {
      return NextResponse.json(
        { error: "Formato inválido" },
        { status: 400 }
      );
    }

    const sales = await Promise.all(
      items.map((item) => {
        if (!item.matchedProductId) return null;

        return prisma.sale.create({
          data: {
            userId,
            productId: item.matchedProductId,
            quantity: Number(item.quantity),
            saleDate: new Date(),
            xmlFilename: item.xmlFilename || null,
          },
        });
      })
    );

    return NextResponse.json({ ok: true, count: sales.length });
  } catch (error) {
    console.error("CONFIRM ERROR:", error); // 🔥 esto sí sirve

    return NextResponse.json(
      { error: "Error al guardar ventas" },
      { status: 500 }
    );
  }
}