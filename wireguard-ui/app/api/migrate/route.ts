import { NextResponse } from 'next/server'
import { DatabaseError } from "sequelize"
import Server from '@/models/server'
import User from '@/models/user'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    await Server.sync({ alter: true })
    await User.sync({ alter: true })

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
