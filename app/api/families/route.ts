import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

const userId = "1" // TEMPORAL

// 🔹 GET - listar familias
export async function GET() {
  try {

    const families = await prisma.family.findMany({
      where: {
        userId
      },
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json(families)

  } catch (error) {

    console.error("GET /families error:", error)

    return NextResponse.json(
      { error: 'Error al obtener familias' },
      { status: 500 }
    )
  }
}


// 🔹 POST - crear familia
export async function POST(req: Request) {
  try {

    const { name } = await req.json()

    if (!name) {
      return NextResponse.json(
        { error: 'Nombre requerido' },
        { status: 400 }
      )
    }

    // 🔹 verificar duplicado
    const existing = await prisma.family.findFirst({
      where: {
        name,
        userId
      }
    })

    if (existing) {
      return NextResponse.json(
        { error: 'La familia ya existe' },
        { status: 400 }
      )
    }

    const family = await prisma.family.create({
      data: {
        name,
        userId
      }
    })

    return NextResponse.json(family)

  } catch (error) {

    console.error("POST /families error:", error)

    return NextResponse.json(
      { error: 'Error al crear familia' },
      { status: 500 }
    )
  }
}