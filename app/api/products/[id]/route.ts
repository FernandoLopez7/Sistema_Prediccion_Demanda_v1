import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

type RecipeInput = {
  materialId: string;
  quantity: number | string;
};

function getId(req: Request) {
  return new URL(req.url).pathname.split("/").pop();
}

export async function PUT(req: Request) {
  try {
    const id = getId(req);
    const body = await req.json();

    const {
      name,
      code,
      unitId, // 🔥 cambio
      branchId, // 🔥 nuevo
      familyId, // 🔥 nuevo
      safetyStock,
      stock,
      recipes,
    }: {
      name: string;
      code?: string;
      unitId: string;
      branchId: string;
      familyId: string;
      safetyStock?: number;
      stock?: number;
      recipes: RecipeInput[];
    } = body;

    if (!id) {
      return NextResponse.json({ error: "ID requerido" }, { status: 400 });
    }
    console.log({
      name,
      unitId,
      branchId,
      familyId,
      recipes,
    });

    if (!name || !unitId || !branchId || !familyId) {
      return NextResponse.json(
        { error: "Nombre, unidad, sucursal y familia requeridos" },
        { status: 400 },
      );
    }

    if (!Array.isArray(recipes)) {
      return NextResponse.json(
        { error: "Formato inválido de recetas" },
        { status: 400 },
      );
    }

    const updatedProduct = await prisma.$transaction(async (tx) => {
      // 1. actualizar producto
      const product = await tx.product.update({
        where: { id },
        data: {
          name,
          code: code || null,
          unitId, // 🔥 FIX
          branchId, // 🔥 FIX
          familyId, // 🔥 FIX
          ...(stock !== undefined && { stock: Number(stock) }),
          safetyStock: Number(safetyStock) || 0,
        },
      });

      // 2. eliminar recetas anteriores
      await tx.recipe.deleteMany({
        where: { productId: id },
      });

      // 3. crear nuevas recetas
      const validRecipes = recipes
        .filter((r) => r.materialId && r.quantity)
        .map((r) => ({
          materialId: r.materialId,
          quantity: Number(r.quantity),
        }));

      for (const r of validRecipes) {
        await tx.recipe.create({
          data: {
            productId: id,
            materialId: r.materialId,
            quantity: r.quantity,
          },
        });
      }

      return product;
    });

    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error("PUT /products error:", error);

    return NextResponse.json(
      { error: "Error al actualizar producto" },
      { status: 500 },
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const id = getId(req);

    if (!id) {
      return NextResponse.json({ error: "ID requerido" }, { status: 400 });
    }

    await prisma.$transaction(async (tx) => {
      // 1. eliminar recetas relacionadas
      await tx.recipe.deleteMany({
        where: { productId: id },
      });

      // 2. eliminar producto
      await tx.product.delete({
        where: { id },
      });
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("DELETE /products error:", error);

    return NextResponse.json(
      { error: "Error al eliminar producto" },
      { status: 500 },
    );
  }
}
