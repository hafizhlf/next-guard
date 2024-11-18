import { NextResponse } from 'next/server'
import { DatabaseError, UniqueConstraintError } from "sequelize"
import { getServerSession } from 'next-auth'
import authOptions from 'lib/authOption'
import Peer from 'models/peer'
import Server from 'models/server'


export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const peerId = params.id

    const peer = await Peer.findByPk(peerId)
    if (!peer) {
      return NextResponse.json(
        { error: 'Peer not found' },
        { status: 404 }
      )
    }

    const server = await Server.findByPk(peer.server_id)
    if (!server) {
      return NextResponse.json(
        { error: 'Server not found' },
        { status: 404 }
      )
    }

    // Generate the WireGuard config
    const config = 
`[Interface]
PrivateKey = ${peer.private_key}
Address = ${peer.ip_address}
DNS = 1.1.1.1

[Peer]
PublicKey = ${server.public_key}
PresharedKey = ${peer.preshared_key}
Endpoint = ${server.public_ip.trim()}:${server.port}
AllowedIPs = 0.0.0.0/0`

    const headers = new Headers()
    headers.set('Content-Type', 'text/plain')
    headers.set('Content-Disposition', `attachment; filename=wireguard-${peer.name}.conf`)

    return new Response(config, {
      status: 200,
      headers: headers,
    })
  } catch (error) {
    if (error instanceof DatabaseError) {
      const messages = "Database connection error"
      return NextResponse.json(
        { error: messages },
        { status: 500 }
      )
    }
    if (error instanceof UniqueConstraintError) {
      const messages = error.errors.map(e => e.message)
      return NextResponse.json(
        { error: messages },
        { status: 500 }
      )
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const peerId = params.id

    const peer = await Peer.findByPk(peerId)
    if (!peer) {
      return NextResponse.json(
        { error: 'Peer not found' },
        { status: 404 }
      )
    }

    peer.destroy()
    return NextResponse.json(
      { message: 'Peer deleted successfully' },
      { status: 200 }
    )
  } catch (error) {
    if (error instanceof DatabaseError) {
      const messages = "Database connection error"
      return NextResponse.json(
        { error: messages },
        { status: 500 }
      )
    }
    if (error instanceof UniqueConstraintError) {
      const messages = error.errors.map(e => e.message)
      return NextResponse.json(
        { error: messages },
        { status: 500 }
      )
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}