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

    const product = await prisma.product.update({
      where: { id },
      data: {
        name: body.name,
        code: body.code || null,
        unit: body.unit,
        safetyStock: Number(body.safetyStock) || 0
      }
    })

    return NextResponse.json(product)
  } catch (error) {
    return NextResponse.json({ error: 'Error al actualizar' }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const id = getId(req)

    if (!id) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 })
    }

    await prisma.product.delete({
      where: { id }
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json({ error: 'Error al eliminar' }, { status: 500 })
  }
}