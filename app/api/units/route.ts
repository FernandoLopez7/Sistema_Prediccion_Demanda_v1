import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

// 🔹 GET - listar unidades
export async function GET() {
  try {
    const units = await prisma.unit.findMany({
      orderBy: { name: 'asc' }
    })

    return NextResponse.json(units)
  } catch (error) {
    console.error("GET /units error:", error)
    return NextResponse.json(
      { error: 'Error al obtener unidades' },
      { status: 500 }
    )
  }
}

// 🔹 POST - crear unidad
export async function POST(req: Request) {
  try {
    const { name } = await req.json()

    if (!name) {
      return NextResponse.json(
        { error: 'Nombre requerido' },
        { status: 400 }
      )
    }

    const unit = await prisma.unit.create({
      data: { name }
    })

    return NextResponse.json(unit)
  } catch (error) {
    console.error("POST /units error:", error)
    return NextResponse.json(
      { error: 'Error al crear unidad' },
      { status: 500 }
    )
  }
}