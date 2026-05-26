import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

// 🔹 PUT - actualizar familia
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {

    const { id } = await params
    const { name } = await req.json()

    const family = await prisma.family.update({
      where: { id },
      data: { name }
    })

    return NextResponse.json(family)

  } catch (error) {

    console.error("PUT /families error:", error)

    return NextResponse.json(
      { error: 'Error al actualizar familia' },
      { status: 500 }
    )
  }
}


// 🔹 DELETE - eliminar familia
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {

    const { id } = await params

    await prisma.family.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })

  } catch (error) {

    console.error("DELETE /families error:", error)

    return NextResponse.json(
      { error: 'Error al eliminar familia' },
      { status: 500 }
    )
  }
}