import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

const userId = "1";

const getMonthLabel = (date: Date) => {
  return new Intl.DateTimeFormat("es-ES", {
    month: "short",
    year: "numeric",
  }).format(date);
};

const getNextMonths = (count: number) => {
  const months: string[] = [];
  const today = new Date();

  for (let i = 1; i <= count; i++) {
    const next = new Date(today.getFullYear(), today.getMonth() + i, 1);
    months.push(getMonthLabel(next));
  }

  return months;
};

export async function GET() {
  try {
    const today = new Date();
    const threeMonthsAgo = new Date(today);
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const [products, materials, movements] = await Promise.all([
      prisma.product.findMany({
        where: { userId },
        select: {
          id: true,
          name: true,
          stock: true,
          safetyStock: true,
        },
      }),
      prisma.material.findMany({
        where: { userId },
        select: {
          id: true,
          name: true,
          stock: true,
          reorderPoint: true,
        },
      }),
      prisma.stockMovement.findMany({
        where: {
          userId,
          type: "OUT",
          movementDate: {
            gte: threeMonthsAgo,
          },
          productId: {
            not: null,
          },
        },
        select: {
          quantity: true,
          productId: true,
          movementDate: true,
        },
      }),
    ]);

    const movementsByProduct = movements.reduce<Record<string, number>>(
      (acc, movement) => {
        const productId = movement.productId as string;
        const qty = Number(movement.quantity) || 0;
        acc[productId] = (acc[productId] ?? 0) + qty;
        return acc;
      },
      {},
    );

    const projectionMonths = getNextMonths(3);

    const productProjections = products.map((product) => {
      const totalOut = movementsByProduct[product.id] ?? 0;
      const averageMonthly = totalOut / 3;
      const projectedSales = projectionMonths.map((month) => ({
        month,
        quantity: Math.round(averageMonthly * 100) / 100,
      }));

      const currentStock = Number(product.stock);
      const safetyStock = Number(product.safetyStock);

      let status: "normal" | "warning" | "critical" = "normal";
      if (currentStock <= safetyStock) {
        status = "critical";
      } else if (currentStock <= safetyStock * 1.5) {
        status = "warning";
      }

      return {
        id: product.id,
        name: product.name,
        currentStock,
        safetyStock,
        projectedSales,
        status,
      };
    });

    const alerts = [
      ...products.flatMap((product) => {
        const currentStock = Number(product.stock);
        const safetyStock = Number(product.safetyStock);
        if (safetyStock <= 0) return [];

        if (currentStock <= safetyStock) {
          return [
            {
              type: "product" as const,
              id: product.id,
              name: product.name,
              message: `Stock crítico. Stock actual ${currentStock} <= stock de seguridad ${safetyStock}`,
              severity: "critical" as const,
            },
          ];
        }

        if (currentStock <= safetyStock * 1.5) {
          return [
            {
              type: "product" as const,
              id: product.id,
              name: product.name,
              message: `Stock en nivel de advertencia. Stock actual ${currentStock} cerca del stock de seguridad ${safetyStock}`,
              severity: "warning" as const,
            },
          ];
        }

        return [];
      }),
      ...materials.flatMap((material) => {
        const currentStock = Number(material.stock);
        const reorderPoint = Number(material.reorderPoint ?? 0);
        if (reorderPoint <= 0) return [];

        if (currentStock <= reorderPoint) {
          return [
            {
              type: "material" as const,
              id: material.id,
              name: material.name,
              message: `Material con stock crítico. Stock actual ${currentStock} <= punto de reorden ${reorderPoint}`,
              severity: "critical" as const,
            },
          ];
        }

        if (currentStock <= reorderPoint * 1.2) {
          return [
            {
              type: "material" as const,
              id: material.id,
              name: material.name,
              message: `Material cerca del punto de reorden. Stock actual ${currentStock} cerca de ${reorderPoint}`,
              severity: "warning" as const,
            },
          ];
        }

        return [];
      }),
    ];

    return NextResponse.json({ products: productProjections, alerts });
  } catch (error) {
    console.error("GET /projections error:", error);
    return NextResponse.json(
      { error: "Error al generar proyecciones" },
      { status: 500 },
    );
  }
}
