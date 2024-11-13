import { NextResponse } from 'next/server'
import { DatabaseError, UniqueConstraintError } from "sequelize"
import { getServerSession } from 'next-auth'
import authOptions from 'lib/authOption'
import { peerTransferRate } from "lib/wireguard"
import Peer from 'models/peer'

export const dynamic = 'force-dynamic'

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

    const serverId = params.id
    const peers = await Peer.findAll({
      where: {
        server_id: serverId,
      },
      order: [['id', 'asc']]
    })

    const convertRate = (bytes: number) => {
      const kilobytes = bytes / 1024 // Convert bytes to kilobytes

      // Determine unit based on size
      if (kilobytes < 1024) {
        // Less than 1 KB, return as KB
        return { value: kilobytes, unit: 'KB' }
      } else if (kilobytes < 1048576) {
        // Less than 1 MB, return as MB
        const mb = kilobytes / 1024
        return { value: mb, unit: 'MB' }
      } else if (kilobytes < 1073741824) {
        // Less than 1 GB, return as GB
        const gb = kilobytes / 1048576
        return { value: gb, unit: 'GB' }
      } else {
        // Greater than or equal to 1 GB, return as GB
        const gb = kilobytes / 1048576
        return { value: gb, unit: 'GB' }
      }
    }

    const response = await Promise.all(peers.map(async peer => {
      const { sent, received } = await peerTransferRate(peer.public_key)

      const receivedRate = convertRate(received);
      const sentRate = convertRate(sent);

      return {
        ...peer.toJSON(),
        received: `${receivedRate.value.toFixed(2)} ${receivedRate.unit}`,
        sent: `${sentRate.value.toFixed(2)} ${sentRate.unit}`,
      }
    }))

    return NextResponse.json(response)
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