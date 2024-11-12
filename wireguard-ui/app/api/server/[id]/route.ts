import { NextResponse } from 'next/server'
import { DatabaseError, UniqueConstraintError } from "sequelize"
import { getServerSession } from 'next-auth'
import authOptions from 'lib/authOption'
import Server from 'models/server'
import Peer from 'models/peer'
import { isValidIpAddress } from 'lib/utils'
import { createWireguardFile, removeWireguardFile, startWireguardServer, stopWireguardServer } from 'lib/wireguard'

export async function PUT(
  request: Request,
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

    const data = await request.json()
    const { name, port, status, ip_address } = data
    const serverId = params.id
    const server = await Server.findByPk(serverId)

    if (!server) {
      return NextResponse.json(
        { error: 'Server not found' },
        { status: 404 }
      )
    }

    const updateData: { name?: string, port?: number, status?: string, ip_address?: string } = {}

    if (name) updateData.name = name
    if (port) updateData.port = port
    if (status) updateData.status = status

    if (ip_address) {
      const isValid = isValidIpAddress(ip_address)

      if (!isValid) {
        return NextResponse.json(
          { error: 'Invalid IP address' },
          { status: 400 }
        )
      }
      updateData.ip_address = ip_address
    }

    if (status === "Online") {
      const WG_PRE_UP = ''
      const WG_POST_UP = `iptables -t nat -A POSTROUTING -s ${server.ip_address} -o eth0 -j MASQUERADE;
iptables -A INPUT -p udp -m udp --dport ${server.port} -j ACCEPT;
iptables -A FORWARD -i wg0 -j ACCEPT;
iptables -A FORWARD -o wg0 -j ACCEPT;`.split('\n').join(' ')
      const WG_POST_DOWN = `iptables -t nat -D POSTROUTING -s ${server.ip_address} -o eth0 -j MASQUERADE;
iptables -D INPUT -p udp -m udp --dport ${server.port} -j ACCEPT;
iptables -D FORWARD -i wg0 -j ACCEPT;
iptables -D FORWARD -o wg0 -j ACCEPT;`.split('\n').join(' ')
      const WG_PRE_DOWN = ''

      const filename = `${server.name}`
      let content =
        `# WireGuard Configuration
# Server name = ${server.name}
[Interface]
PrivateKey = ${server.private_key}
Address = ${server.ip_address}
ListenPort = ${server.port}
PreUp = ${WG_PRE_UP}
PostUp = ${WG_POST_UP}
PreDown = ${WG_PRE_DOWN}
PostDown = ${WG_POST_DOWN}
`

      const peers = await Peer.findAll({
        where: {
          server_id: serverId,
        },
        order: [['id', 'asc']]
      })

      peers.forEach(peer => {
        content += `

# Client: ${peer.name} (${peer.id})
[Peer]
PublicKey = ${peer.public_key}
${peer.preshared_key ? `PresharedKey = ${peer.preshared_key}\n` : ''}AllowedIPs = ${peer.ip_address}/32
`})

      try {
        await createWireguardFile(filename, content)
        await startWireguardServer(filename)
      } catch (fileError) {
        let errorMessage = 'Failed to create WireGuard file'

        if (fileError instanceof Error) {
          errorMessage = `Failed to create WireGuard file: ${fileError.message}`
        }

        return NextResponse.json(
          { error: errorMessage },
          { status: 500 }
        )
      }
    } else {
      const filename = `${server.name}`

      try {
        await stopWireguardServer(filename)
        await removeWireguardFile(filename)
      } catch (fileError) {
        let errorMessage = 'Failed to remove WireGuard file'

        if (fileError instanceof Error) {
          errorMessage = `Failed to remove WireGuard file: ${fileError.message}`
        }

        return NextResponse.json(
          { error: errorMessage },
          { status: 500 }
        )
      }
    }

    const updatedServer = await server.update(updateData)

    return NextResponse.json(updatedServer)
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

    const serverId = params.id

    const server = await Server.findByPk(serverId)
    if (!server) {
      return NextResponse.json(
        { error: 'Server not found' },
        { status: 404 }
      )
    }

    server.destroy()
    return NextResponse.json(
      { message: 'Server deleted successfully' },
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
