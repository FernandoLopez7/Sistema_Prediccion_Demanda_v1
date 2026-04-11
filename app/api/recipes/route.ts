import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const recipes = await prisma.recipe.findMany({
      include: {
        product: true,
        material: true
      }
    })

    return NextResponse.json(recipes)
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al obtener recetas' },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()

    if (!body.productId || !body.materialId || !body.quantity) {
      return NextResponse.json(
        { error: 'Datos incompletos' },
        { status: 400 }
      )
    }

    const recipe = await prisma.recipe.create({
      data: {
        productId: body.productId,
        materialId: body.materialId,
        quantity: Number(body.quantity)
      }
    })

    return NextResponse.json(recipe)
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al crear receta' },
      { status: 500 }
    )
  }
}