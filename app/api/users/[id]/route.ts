import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

function getIdFromUrl(req: Request) {
  const { pathname } = new URL(req.url)
  return pathname.split('/').pop()
}

export async function PUT(req: Request) {
  try {
    const id = getIdFromUrl(req)

    if (!id) {
      return NextResponse.json(
        { error: 'ID requerido' },
        { status: 400 }
      )
    }

    const body = await req.json()

    const user = await prisma.user.update({
      where: { id },
      data: {
        email: body.email,
        name: body.name || null
      }
    })

    return NextResponse.json(user)
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al actualizar usuario' },
      { status: 500 }
    )
  }
}

export async function DELETE(req: Request) {
  try {
    const id = getIdFromUrl(req)

    if (!id) {
      return NextResponse.json(
        { error: 'ID requerido' },
        { status: 400 }
      )
    }

    await prisma.user.delete({
      where: { id }
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al eliminar usuario' },
      { status: 500 }
    )
  }
}