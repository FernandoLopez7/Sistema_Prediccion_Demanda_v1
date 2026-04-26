import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

const userId = "1"

export async function GET() {
  try {
    const materials = await prisma.material.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        unit: {
          select: { name: true }
        },
        branch: {
          select: { name: true }
        }
      }
    })

    return NextResponse.json(materials)
  } catch (error) {
    console.error("GET /materials error:", error)

    return NextResponse.json(
      { error: 'Error al obtener materiales' },
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

    const material = await prisma.material.create({
      data: {
        userId,
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
      }
    })

    return NextResponse.json(material)
  } catch (error) {
    console.error("POST /materials error:", error)

    return NextResponse.json(
      { error: 'Error al crear material' },
      { status: 500 }
    )
  }
}