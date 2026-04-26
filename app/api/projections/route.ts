import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

const userId = "1";

export async function GET() {
  try {
    // Obtener ventas agrupadas por producto (últimos 6 meses)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const salesData = await prisma.sale.groupBy({
      by: ["productId"],
      where: {
        userId,
        saleDate: {
          gte: sixMonthsAgo,
        },
      },
      _sum: {
        quantity: true,
      },
    });

    // Obtener productos con sus recetas
    const products = await prisma.product.findMany({
      where: { userId },
      include: {
        recipes: {
          include: {
            material: true,
          },
        },
      },
    });

    // Obtener materiales con stock actual
    const materials = await prisma.material.findMany({
      where: { userId },
    });

    // Función para calcular proyección simple basada en promedio
    const calculateProjection = (totalSales: number, months: number = 6) => {
      const monthlyAvg = totalSales / months;
      // Proyección conservadora: 80% del promedio histórico
      const projectedMonthly = Math.round(monthlyAvg * 0.8);

      return [
        projectedMonthly,
        Math.round(projectedMonthly * 1.05), // 5% crecimiento
        Math.round(projectedMonthly * 1.1), // 10% crecimiento
      ];
    };

    // Calcular proyecciones de productos
    const productProjections = products.map((product) => {
      const sales = salesData.find((s) => s.productId === product.id);
      const totalSales = sales?._sum?.quantity || 0;
      const projections = calculateProjection(totalSales);

      const projectedSales = [
        { month: "Mes 1", quantity: projections[0] },
        { month: "Mes 2", quantity: projections[1] },
        { month: "Mes 3", quantity: projections[2] },
      ];

      // Determinar estado basado en stock vs demanda proyectada
      const status =
        product.stock <= product.safetyStock
          ? "critical"
          : product.stock <= product.safetyStock * 1.5
            ? "warning"
            : "normal";

      return {
        id: product.id,
        name: product.name,
        currentStock: product.stock,
        safetyStock: product.safetyStock,
        projectedSales,
        status,
      };
    });

    // Calcular demanda de materiales basada en proyecciones de productos
    const materialDemand = new Map<string, number[]>();

    products.forEach((product) => {
      const sales = salesData.find((s) => s.productId === product.id);
      const totalSales = sales?._sum?.quantity || 0;
      const projections = calculateProjection(totalSales);

      projections.forEach((proj, index) => {
        if (product.recipes && Array.isArray(product.recipes)) {
          product.recipes.forEach((recipe) => {
            const materialId = recipe.materialId;
            const demand = recipe.quantity * proj;

            if (!materialDemand.has(materialId)) {
              materialDemand.set(materialId, [0, 0, 0]);
            }

            const demands = materialDemand.get(materialId)!;
            demands[index] += demand;
          });
        }
      });
    });

    // Calcular proyecciones de materiales
    const materialProjections = materials.map((material) => {
      const demands = materialDemand.get(material.id) || [0, 0, 0];

      const projectedDemand = [
        { month: "Mes 1", quantity: Math.round(demands[0]) },
        { month: "Mes 2", quantity: Math.round(demands[1]) },
        { month: "Mes 3", quantity: Math.round(demands[2]) },
      ];

      // Determinar estado basado en stock vs demanda proyectada
      const reorderPoint = material.reorderPoint || 0;
      const status =
        material.stock <= reorderPoint
          ? "critical"
          : material.stock <= reorderPoint * 1.5
            ? "warning"
            : "normal";

      return {
        id: material.id,
        name: material.name,
        currentStock: material.stock,
        reorderPoint,
        projectedDemand,
        status,
      };
    });

    // Generar alertas
    const alerts: Array<{
      type: "product" | "material";
      id: string;
      name: string;
      message: string;
      severity: "warning" | "critical";
    }> = [];

    productProjections.forEach((product) => {
      if (product.status === "critical") {
        alerts.push({
          type: "product" as const,
          id: product.id,
          name: product.name,
          message: `Stock crítico: ${product.currentStock} unidades (seguridad: ${product.safetyStock})`,
          severity: "critical" as const,
        });
      } else if (product.status === "warning") {
        alerts.push({
          type: "product" as const,
          id: product.id,
          name: product.name,
          message: `Stock bajo: ${product.currentStock} unidades (seguridad: ${product.safetyStock})`,
          severity: "warning" as const,
        });
      }
    });

    materialProjections.forEach((material) => {
      if (material.status === "critical") {
        alerts.push({
          type: "material" as const,
          id: material.id,
          name: material.name,
          message: `Material crítico: ${material.currentStock} unidades (punto reorden: ${material.reorderPoint})`,
          severity: "critical" as const,
        });
      } else if (material.status === "warning") {
        alerts.push({
          type: "material" as const,
          id: material.id,
          name: material.name,
          message: `Material bajo: ${material.currentStock} unidades (punto reorden: ${material.reorderPoint})`,
          severity: "warning" as const,
        });
      }
    });

    return NextResponse.json({
      products: productProjections,
      materials: materialProjections,
      alerts,
    });
  } catch (error) {
    console.error("Error en proyecciones:", error);
    console.error(
      "Stack trace:",
      error instanceof Error ? error.stack : "No stack trace",
    );
    return NextResponse.json(
      {
        error: "Error al calcular proyecciones",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
