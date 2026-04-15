import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

const userId = "1"

export async function GET() {
  try {
    const materials = await prisma.material.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
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
    console.log("POST body:", body)

    if (!body.name || !body.unit) {
      return NextResponse.json(
        { error: 'Nombre y unidad requeridos' },
        { status: 400 }
      )
    }

    const material = await prisma.material.create({
      data: {
        userId,
        name: body.name,
        code: body.code || null,
        unit: body.unit,
        stock: Number(body.stock) || 0,

        // nuevos campos
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
    console.error("POST /materials error:", error)

    return NextResponse.json(
      { error: 'Error al crear material' },
      { status: 500 }
    )
  }
}