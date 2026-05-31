import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

const userId = "1" // TEMPORAL

type RecipeInput = {
  materialId: string
  quantity: number | string
}

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        recipes: {
          include: {
            material: true // 🔥 nombre del material
          }
        },
        unit: {
          select: { name: true } // 🔥 nombre unidad
        },
        branch: {
          select: { id: true, name: true } // 🔥 id y nombre sucursal
        },
        family: {
          select: { name: true } // 🔥 nombre familia
        }
      }
    })

    return NextResponse.json(products)

  } catch (error) {
    console.error("GET /products error:", error)

    return NextResponse.json(
      { error: 'Error al obtener productos' },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const {
      name,
      code,
      unitId,     // 🔥 cambio
      branchId,   // 🔥 nuevo
      familyId,     // 🔥 nuevo
      safetyStock,
      stock,
      recipes
    }: {
      name: string
      code?: string
      unitId: string
      branchId: string
      familyId: string
      safetyStock?: number
      stock?: number
      recipes: RecipeInput[]
    } = body

    // 🔴 validación mínima correcta
    if (!name || !unitId || !branchId || !familyId) {
      return NextResponse.json(
        { error: 'Nombre, unidad, sucursal y familia requeridos' },
        { status: 400 }
      )
    }

    if (!recipes || !Array.isArray(recipes) || recipes.length === 0) {
      return NextResponse.json(
        { error: 'Debe incluir al menos una receta' },
        { status: 400 }
      )
    }

    const product = await prisma.$transaction(async (tx) => {

      const newProduct = await tx.product.create({
        data: {
          userId,
          name,
          code: code || null,
          unitId,     // 🔥 FIX
          branchId,   // 🔥 FIX
          familyId,   // 🔥 FIX
          stock: Number(stock) || 0,
          safetyStock: Number(safetyStock) || 0
        }
      })

      const validRecipes = recipes
        .filter((r) => r.materialId && r.quantity)
        .map((r) => ({
          materialId: r.materialId,
          quantity: Number(r.quantity)
        }))

      for (const r of validRecipes) {
        await tx.recipe.create({
          data: {
            productId: newProduct.id,
            materialId: r.materialId,
            quantity: r.quantity
          }
        })
      }

      return newProduct
    })

    return NextResponse.json(product)

  } catch (error) {
    console.error("POST /products error:", error)

    return NextResponse.json(
      { error: 'Error al crear producto' },
      { status: 500 }
    )
  }
}