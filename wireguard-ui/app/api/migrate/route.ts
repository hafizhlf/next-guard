import { NextResponse } from 'next/server'
import { DatabaseError } from "sequelize"
import User from 'models/user'
import Server from 'models/server'
import Peer from 'models/peer'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    await User.sync({ alter: true })
    await Server.sync({ alter: true })
    await Peer.sync({ alter: true })

    return NextResponse.json({
        "message": "Migrate successfully"
    })
  } catch (error) {
    console.log(error)
    if (error instanceof DatabaseError) {
      const messages = "Database connection error"
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
