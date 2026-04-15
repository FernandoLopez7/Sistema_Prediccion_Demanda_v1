import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

function getId(req: Request) {
  return new URL(req.url).pathname.split('/').pop()
}

export async function PUT(req: Request) {
  try {
    const id = getId(req)
    const body = await req.json()

    console.log("PUT id:", id)
    console.log("PUT body:", body)

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

        previous: body.previous ? Number(body.previous) : null,
        entries: body.entries ? Number(body.entries) : null,
        exits: body.exits ? Number(body.exits) : null,
        average: body.average ? Number(body.average) : null,
        unitPrice: body.unitPrice ? Number(body.unitPrice) : null,
        warehouse: body.warehouse || null,

        reorderPoint: body.reorderPoint
          ? Number(body.reorderPoint)
          : null
      }
    })

    return NextResponse.json(material)
  } catch (error) {
    console.error("PUT /materials error:", error)

    return NextResponse.json(
      { error: 'Error al actualizar material' },
      { status: 500 }
    )
  }
}

export async function DELETE(req: Request) {
  try {
    const id = getId(req)

    console.log("DELETE id:", id)

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
    console.error("DELETE /materials error:", error)

    return NextResponse.json(
      { error: 'Error al eliminar material' },
      { status: 500 }
    )
  }
}