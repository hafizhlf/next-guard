import { NextResponse } from 'next/server'
import { UniqueConstraintError } from "sequelize"
import { getServerSession } from 'next-auth'
import authOptions from '@/lib/authOption'
import Server from '@/models/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    await Server.sync({ alter: true })

    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const servers = await Server.findAll({
      order: [['id', 'asc']]
    })

    return NextResponse.json(servers)
  } catch (error) {
    console.error('Error fetching servers:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    await Server.sync({ alter: true })

    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { name, ip_address, port } = await request.json()

    const server = await Server.create({
      name,
      ip_address,
      port,
    })

    return NextResponse.json(server, {status: 201})
  } catch (error) {
    if (error instanceof UniqueConstraintError) {
      const messages = error.errors.map(e => e.message)
      return NextResponse.json(
        { error: messages},
        { status: 500 }
      )
    }
    return NextResponse.json(
      { error: 'Internal server error'},
      { status: 500 }
    )
  }
}
