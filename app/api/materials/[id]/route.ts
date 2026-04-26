import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const body = await req.json()

    if (!id) {
      return NextResponse.json(
        { error: 'ID requerido' },
        { status: 400 }
      )
    }

    const {
      name,
      code,
      unitId,
      branchId,
      stock,
      previous,
      entries,
      exits,
      average,
      unitPrice,
      warehouse,
      reorderPoint
    } = body

    if (!name || !unitId || !branchId) {
      return NextResponse.json(
        { error: 'Nombre, unidad y sucursal requeridos' },
        { status: 400 }
      )
    }

    const material = await prisma.material.update({
      where: { id },
      data: {
        name,
        code: code || null,
        unitId,
        branchId,
        stock: Number(stock) || 0,

        previous: previous ? Number(previous) : null,
        entries: entries ? Number(entries) : null,
        exits: exits ? Number(exits) : null,
        average: average ? Number(average) : null,
        unitPrice: unitPrice ? Number(unitPrice) : null,
        warehouse: warehouse || null,
        reorderPoint: reorderPoint ? Number(reorderPoint) : null
      },
      include: {
        unit: { select: { name: true } },
        branch: { select: { name: true } }
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

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params

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