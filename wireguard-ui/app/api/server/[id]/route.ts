import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import authOptions from '@/lib/authOption'
import Server from '@/models/server'

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const serverId = params.id;

    const server = await Server.findByPk(serverId);
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
    console.error('Error deleting server:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
