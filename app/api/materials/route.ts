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
    return NextResponse.json(
      { error: 'Error al obtener materiales' },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()

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
        reorderPoint: body.reorderPoint
          ? Number(body.reorderPoint)
          : null
      }
    })

    return NextResponse.json(material)
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al crear material' },
      { status: 500 }
    )
  }
}