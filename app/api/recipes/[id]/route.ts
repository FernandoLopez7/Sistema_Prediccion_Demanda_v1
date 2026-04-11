import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

function getId(req: Request) {
  return new URL(req.url).pathname.split('/').pop()
}

export async function PUT(req: Request) {
  try {
    const id = getId(req)
    const body = await req.json()

    if (!id) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 })
    }

    const recipe = await prisma.recipe.update({
      where: { id },
      data: {
        productId: body.productId,
        materialId: body.materialId,
        quantity: Number(body.quantity)
      }
    })

    return NextResponse.json(recipe)
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al actualizar receta' },
      { status: 500 }
    )
  }
}

export async function DELETE(req: Request) {
  try {
    const id = getId(req)

    if (!id) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 })
    }

    await prisma.recipe.delete({
      where: { id }
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al eliminar receta' },
      { status: 500 }
    )
  }
}