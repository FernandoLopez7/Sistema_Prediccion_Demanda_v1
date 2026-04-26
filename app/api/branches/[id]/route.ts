import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

// 🔹 PUT - actualizar sucursal
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { name } = await req.json()
    const { id } = params

    const branch = await prisma.branch.update({
      where: { id },
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

// 🔹 DELETE
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    await prisma.branch.delete({
      where: { id }
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