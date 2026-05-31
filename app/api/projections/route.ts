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

const getMonthsFromKeys = (keys: string[]) => {
  const uniqueKeys = Array.from(new Set(keys)).sort();
  const months: string[] = uniqueKeys.map((monthKey) => {
    const [yearStr, monthStr] = monthKey.split("-");
    const year = Number(yearStr);
    const month = Number(monthStr) - 1;
    return getMonthLabel(new Date(year, month, 1));
  });
  return { months, keys: uniqueKeys };
};

const getMonthKey = (date: Date) =>
  `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;

const getMonthLabelFromKey = (monthKey: string) => {
  const [yearStr, monthStr] = monthKey.split("-");
  return getMonthLabel(new Date(Number(yearStr), Number(monthStr) - 1, 1));
};

const getMonthKeysBetween = (startKey: string, endKey: string) => {
  const [startYear, startMonth] = startKey.split("-").map(Number);
  const [endYear, endMonth] = endKey.split("-").map(Number);
  const keys: string[] = [];
  let current = new Date(startYear, startMonth - 1, 1);
  const end = new Date(endYear, endMonth - 1, 1);

  while (current <= end) {
    keys.push(getMonthKey(current));
    current = new Date(current.getFullYear(), current.getMonth() + 1, 1);
  }

  return keys;
};

const getPreviousMonthKeys = (monthKey: string, count: number) => {
  const [yearStr, monthStr] = monthKey.split("-");
  let year = Number(yearStr);
  let month = Number(monthStr) - 1;
  const keys: string[] = [];

  for (let i = 0; i < count; i++) {
    month -= 1;
    if (month < 0) {
      month = 11;
      year -= 1;
    }
    keys.unshift(`${year}-${String(month + 1).padStart(2, "0")}`);
  }

  return keys;
};

const getPreviousMonthAverage = (
  summary: Record<string, number>,
  monthKey: string,
  count: number,
) => {
  const previousKeys = getPreviousMonthKeys(monthKey, count);
  const previousValues = previousKeys
    .map((key) => summary[key])
    .filter((value): value is number => value !== undefined);
  return previousValues.length ? average(previousValues) : 0;
};

const average = (values: number[]) =>
  values.reduce((sum, value) => sum + value, 0) / Math.max(values.length, 1);

const weightedAverage = (values: number[]) => {
  const weights = values.map((_, index) => index + 1);
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
  const weightedSum = values.reduce(
    (sum, value, index) => sum + value * weights[index],
    0,
  );
  return totalWeight ? weightedSum / totalWeight : 0;
};

const exponentialSmoothing = (values: number[], alpha = 0.5) => {
  if (values.length === 0) return 0;
  let forecast = values[0];
  for (let i = 1; i < values.length; i++) {
    forecast = alpha * values[i - 1] + (1 - alpha) * forecast;
  }
  return alpha * values[values.length - 1] + (1 - alpha) * forecast;
};

const computeMape = (actuals: number[], forecasts: number[]) => {
  const percentages = actuals
    .map((actual, index) => {
      const forecast = forecasts[index];
      if (!actual || forecast === undefined) return null;
      return Math.abs((actual - forecast) / actual) * 100;
    })
    .filter((value): value is number => value !== null);
  if (!percentages.length) return 0;
  return (
    percentages.reduce((sum, value) => sum + value, 0) / percentages.length
  );
};

export async function GET() {
  try {
    const today = new Date();

    const [products, materials, branches] = await Promise.all([
      prisma.product.findMany({
        where: { userId },
        select: {
          id: true,
          name: true,
          stock: true,
          safetyStock: true,
          branchId: true,
          branch: { select: { id: true, name: true } },
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
      prisma.branch.findMany({
        where: { userId },
        select: { id: true, name: true },
      }),
    ]);

    const summaries = await prisma.msummary.findMany({
      where: {
        product_id: {
          in: products.map((product) => product.id),
        },
      },
      select: {
        product_id: true,
        sales_month: true,
        sales_value: true,
      },
    });

    const summaryByProductMonth = summaries.reduce<
      Record<string, Record<string, number>>
    >((acc, summary) => {
      const pid = summary.product_id;
      if (!pid) return acc;
      const monthKey = getMonthKey(summary.sales_month!);
      const qty = Number(summary.sales_value) || 0;
      if (!acc[pid]) acc[pid] = {};
      acc[pid][monthKey] = qty;
      return acc;
    }, {});

    const forecastKeys = getMonthKeysBetween("2025-04", "2026-03");
    const forecastMonths = forecastKeys.map(getMonthLabelFromKey);
    const nextMonthKey = getMonthKey(
      new Date(today.getFullYear(), today.getMonth() + 1, 1),
    );

    const productProjections = products.map((product) => {
      const productSummary = summaryByProductMonth[product.id] ?? {};
      const monthlyActuals = forecastKeys.map(
        (key) => productSummary[key] ?? 0,
      );

      const allActualValues = Object.values(productSummary);
      const simpleMovingAverage = average(allActualValues);
      const movingAverageValue = average(allActualValues);
      const weightedMovingAverageValue = weightedAverage(allActualValues);
      const exponentialSmoothedValue = exponentialSmoothing(allActualValues);

      const forecastRecords = forecastKeys.map((key) => {
        const previousKeys = getPreviousMonthKeys(key, 6);
        const prediction = getPreviousMonthAverage(productSummary, key, 6);
        const actual = productSummary[key] ?? null;
        const difference = actual !== null ? prediction - actual : null;
        const percentageError =
          actual !== null && actual !== 0
            ? Math.abs((prediction - actual) / actual) * 100
            : null;

        return {
          key,
          month: getMonthLabelFromKey(key),
          quantity: Math.round(prediction * 100) / 100,
          actual,
          difference:
            difference !== null ? Math.round(difference * 100) / 100 : null,
          percentageError:
            percentageError !== null
              ? Math.round(percentageError * 100) / 100
              : null,
        };
      });

      // next month projection using previous 6 months
      const nextMonthProjection =
        Math.round(
          getPreviousMonthAverage(productSummary, nextMonthKey, 6) * 100,
        ) / 100;

      const validationActuals = forecastRecords
        .filter((record) => record.actual !== null)
        .map((record) => record.actual as number);
      const validationPredictions = forecastRecords
        .filter((record) => record.actual !== null)
        .map((record) => record.quantity);

      const mapeValidation = computeMape(
        validationActuals,
        validationPredictions,
      );

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
        projectedSales: forecastRecords,
        nextMonthProjection,
        branchId: product.branchId,
        branchName: product.branch?.name ?? null,
        status,
        actualMonths: forecastMonths,
        monthlyActuals,
        simpleMovingAverage: Math.round(simpleMovingAverage * 100) / 100,
        movingAverage: Math.round(movingAverageValue * 100) / 100,
        weightedMovingAverage:
          Math.round(weightedMovingAverageValue * 100) / 100,
        exponentialSmoothing: Math.round(exponentialSmoothedValue * 100) / 100,
        mapeSimple: Math.round(mapeValidation * 100) / 100,
        mapeWeighted: Math.round(mapeValidation * 100) / 100,
        mapeExponential: Math.round(mapeValidation * 100) / 100,
      };
    });

    type ProjectionAlert = {
      type: "product" | "material";
      id: string;
      name: string;
      message: string;
      severity: "critical" | "warning";
    };

    const alerts: ProjectionAlert[] = [
      ...products.flatMap((product): ProjectionAlert[] => {
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
      ...materials.flatMap((material): ProjectionAlert[] => {
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

    return NextResponse.json({
      products: productProjections,
      alerts,
      branches,
    });
  } catch (error) {
    console.error("GET /projections error:", error);
    return NextResponse.json(
      { error: "Error al generar proyecciones" },
      { status: 500 },
    );
  }
}
