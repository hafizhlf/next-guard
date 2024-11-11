import { NextResponse } from 'next/server'
import { DatabaseError, UniqueConstraintError } from "sequelize"
import { getServerSession } from 'next-auth'
import authOptions from 'lib/authOption'
import Server from 'models/server'
import { isValidIpAddress } from 'lib/utils'
import { createWireguardFile, removeWireguardFile } from 'lib/wireguard'

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
      const filename = `${server.name}.conf`
      const content = `# WireGuard Configuration\n# Server name = ${server.name}\n[Interface]\nPrivateKey = ${server.private_key}\nAddress = ${server.ip_address}\nListenPort = ${server.port}\n`

      try {
        await createWireguardFile(filename, content)
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
      const filename = `${server.name}.conf`

      try {
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
