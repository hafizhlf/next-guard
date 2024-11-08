import { NextResponse } from 'next/server'
import { DatabaseError, UniqueConstraintError } from "sequelize"
import { getServerSession } from 'next-auth'
import authOptions from '@/lib/authOption'
import Server from '@/models/server'
import { isValidIpAddress } from '@/lib/utils'
import { exec } from 'child_process'
import { promisify } from 'util'

export const dynamic = 'force-dynamic'
const execAsync = promisify(exec)

export async function GET() {
  try {
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
    if (error instanceof DatabaseError) {
      const messages = "Database connection error"
      return NextResponse.json(
        { error: messages},
        { status: 500 }
      )
    }
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

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { name, ip_address, port } = await request.json()
    const isValid = isValidIpAddress(ip_address)

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid IP address' },
        { status: 400 }
      )
    }

    const { stdout: private_key } = await execAsync('wg genkey')
    const server = await Server.create({
      name,
      ip_address,
      port,
      private_key
    })

    return NextResponse.json(server, {status: 201})
  } catch (error) {
    if (error instanceof DatabaseError) {
      const messages = "Database connection error"
      return NextResponse.json(
        { error: messages},
        { status: 500 }
      )
    }
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
