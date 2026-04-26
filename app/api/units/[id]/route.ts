import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { name } = await req.json()

    const unit = await prisma.unit.update({
      where: { id },
      data: { name }
    })

    return NextResponse.json(unit)
  } catch (error) {
    console.error("PUT /units error:", error)

    return NextResponse.json(
      { error: 'Error al actualizar unidad' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    await prisma.unit.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("DELETE /units error:", error)

    return NextResponse.json(
      { error: 'Error al eliminar unidad' },
      { status: 500 }
    )
  }
}