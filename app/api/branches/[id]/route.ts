import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

// 🔹 PUT - actualizar sucursal
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { name } = await req.json()

    const branch = await prisma.branch.update({
      where: { id: params.id },
      data: { name }
    })

    return NextResponse.json(branch)
  } catch (error) {
    console.error("PUT /branches error:", error)
    return NextResponse.json(
      { error: 'Error al actualizar sucursal' },
      { status: 500 }
    )
  }
}

// 🔹 DELETE - eliminar sucursal
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.branch.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("DELETE /branches error:", error)
    return NextResponse.json(
      { error: 'Error al eliminar sucursal' },
      { status: 500 }
    )
  }
}