import { NextResponse } from 'next/server'
import { DatabaseError } from "sequelize"
import createUser from "@/lib/auth"
import User from 'models/user'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const user = await User.findOne()

    if (!user) {
      await createUser("admin", "admin", "Administrator")
    }

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
