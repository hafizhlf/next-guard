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
      const kilobits = (bytes * 8) / 1000;

      // Determine unit based on size
      if (kilobits < 1000) {
        // Less than 1 Kbps, return as Kbps
        return { value: kilobits, unit: 'Kbps' };
      } else if (kilobits < 1000000) {
        // Less than 1 Mbps, return as Mbps
        const mbps = kilobits / 1000;
        return { value: mbps, unit: 'Mbps' };
      } else if (kilobits < 1000000000) {
        // Less than 1 Gbps, return as Gbps
        const gbps = kilobits / 1000000;
        return { value: gbps, unit: 'Gbps' };
      } else {
        // Greater than or equal to 1 Gbps, return as Gbps
        const gbps = kilobits / 1000000;
        return { value: gbps, unit: 'Gbps' };
      }
    }

    const response = await Promise.all(peers.map(async peer => {
      const { received, sent } = await peerTransferRate(peer.public_key)

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