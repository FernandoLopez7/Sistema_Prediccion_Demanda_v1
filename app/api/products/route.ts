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
            material: true // 🔥 importante para mostrar nombre
          }
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
      unit,
      safetyStock,
      stock, // 👈 NUEVO
      recipes
    }: {
      name: string
      code?: string
      unit: string
      safetyStock?: number
      stock?: number // 👈 NUEVO
      recipes: RecipeInput[]
    } = body

    if (!name || !unit) {
      return NextResponse.json(
        { error: 'Nombre y unidad requeridos' },
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
          unit,
          stock: Number(stock) || 0, // 👈 NUEVO
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