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
      return NextResponse.json(
        { error: 'ID requerido' },
        { status: 400 }
      )
    }

    const material = await prisma.material.update({
      where: { id },
      data: {
        name: body.name,
        code: body.code || null,
        unit: body.unit,
        stock: Number(body.stock) || 0,
        reorderPoint: body.reorderPoint
          ? Number(body.reorderPoint)
          : null
      }
    })

    return NextResponse.json(material)
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al actualizar material' },
      { status: 500 }
    )
  }
}

export async function DELETE(req: Request) {
  try {
    const id = getId(req)

    if (!id) {
      return NextResponse.json(
        { error: 'ID requerido' },
        { status: 400 }
      )
    }

    await prisma.material.delete({
      where: { id }
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al eliminar material' },
      { status: 500 }
    )
  }
}