import { NextResponse } from 'next/server'
import { DatabaseError, UniqueConstraintError } from "sequelize"
import { getServerSession } from 'next-auth'
import authOptions from 'lib/authOption'
import Server from 'models/server'
import { isValidIpAddress } from 'lib/utils'
import { prepareWireguardConfig, createWireguardFile, removeWireguardFile, startWireguardServer, stopWireguardServer } from 'lib/wireguard'

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
    const { name, port, status, ip_address, public_ip, dns } = data
    const serverId = params.id
    const server = await Server.findByPk(serverId)

    if (!server) {
      return NextResponse.json(
        { error: 'Server not found' },
        { status: 404 }
      )
    }

    const updateData: { name?: string, port?: number, status?: string, ip_address?: string, public_ip?: string, dns?: string } = {}

    if (name) updateData.name = name
    if (port) updateData.port = port
    if (status) updateData.status = status
    if (public_ip) updateData.public_ip = public_ip
    if (dns) updateData.dns = dns

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
      const filename = `${server.name}`
      const content = await prepareWireguardConfig(server.id)

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
    } 
    if (status === "Offline") {
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
