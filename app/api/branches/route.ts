import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

const userId = "1" // TEMPORAL

// 🔹 GET - listar sucursales del usuario
export async function GET() {
  try {
    const branches = await prisma.branch.findMany({
      where: { userId },
      orderBy: { name: 'asc' }
    })

    return NextResponse.json(branches)
  } catch (error) {
    console.error("GET /branches error:", error)
    return NextResponse.json(
      { error: 'Error al obtener sucursales' },
      { status: 500 }
    )
  }
}

// 🔹 POST - crear sucursal
export async function POST(req: Request) {
  try {
    const { name } = await req.json()

    if (!name) {
      return NextResponse.json(
        { error: 'Nombre requerido' },
        { status: 400 }
      )
    }

    const branch = await prisma.branch.create({
      data: {
        name,
        userId
      }
    })

    return NextResponse.json(branch)
  } catch (error) {
    console.error("POST /branches error:", error)
    return NextResponse.json(
      { error: 'Error al crear sucursal' },
      { status: 500 }
    )
  }
}