import { NextResponse } from 'next/server'
import { DatabaseError, UniqueConstraintError } from "sequelize"
import { getServerSession } from 'next-auth'
import authOptions from '@/lib/authOption'
import { getNextIpAddress } from '@/lib/utils'
import Peer from '@/models/peer'
import Server from '@/models/server'
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

    const peers = await Peer.findAll({
      order: [['id', 'asc']]
    })

    return NextResponse.json(peers)
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

    const { name, server_id } = await request.json()

    const server = await Server.findByPk(server_id)
    if (!server) {
      return NextResponse.json(
        { error: `Server with id ${server_id} not found`},
        { status: 400 }
      )
    }
    const latest_peer = await Peer.findOne({
      order: [['createdAt', 'DESC']]
    })
    let next_ip
    if (!latest_peer) {
      const [current_ip, _subnetMask] = server.ip_address.split('/')
      next_ip = getNextIpAddress(server, current_ip)
    } else {
      next_ip = getNextIpAddress(server, latest_peer.ip_address)
    }
    const { stdout: private_key_raw } = await execAsync('wg genkey')
    const private_key = private_key_raw.trim()
    const { stdout: public_key_raw } = await execAsync(`echo ${private_key} | wg pubkey`)
    const public_key = public_key_raw.trim()
    const { stdout: preshared_key_raw } = await execAsync('wg genpsk')
    const preshared_key = preshared_key_raw.trim()
    const peer = await Peer.create({
      server_id,
      name,
      private_key,
      public_key,
      preshared_key,
      ip_address: next_ip,
      allowed_ips: '0.0.0.0/0'
    })

    return NextResponse.json(peer, {status: 201})
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
