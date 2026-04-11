import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

const userId = "1" // TEMPORAL

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(products)
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener productos' }, { status: 500 })
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

    const product = await prisma.product.create({
      data: {
        userId,
        name: body.name,
        code: body.code || null,
        unit: body.unit,
        safetyStock: Number(body.safetyStock) || 0
      }
    })

    return NextResponse.json(product)
  } catch (error) {
    return NextResponse.json({ error: 'Error al crear producto' }, { status: 500 })
  }
}