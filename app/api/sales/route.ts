import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

const userId = "1"

export async function GET() {
  try {
    const sales = await prisma.sale.findMany({
      where: { userId },
      include: { product: true },
      orderBy: { saleDate: 'desc' }
    })

    return NextResponse.json(sales)
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al obtener ventas' },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const sale = await prisma.sale.create({
      data: {
        userId,
        productId: body.productId,
        quantity: Number(body.quantity),
        saleDate: new Date(body.saleDate)
      }
    })

    return NextResponse.json(sale)
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al crear venta' },
      { status: 500 }
    )
  }
}