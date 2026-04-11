import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

function getId(req: Request) {
  return new URL(req.url).pathname.split('/').pop()
}

export async function DELETE(req: Request) {
  try {
    const id = getId(req)

    if (!id) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 })
    }

    await prisma.sale.delete({
      where: { id }
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al eliminar venta' },
      { status: 500 }
    )
  }
}