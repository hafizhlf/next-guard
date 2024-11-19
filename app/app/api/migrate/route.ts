import { NextResponse } from 'next/server'
import { DatabaseError } from "sequelize"
import bcrypt from 'bcryptjs'
import User from 'models/user'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const user = await User.findOne()

    if (!user) {
      const hashedPassword = await bcrypt.hash("admin", 10)
      await User.create({
        username: "admin",
        password: hashedPassword,
        name: "Administrator",
      })
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
