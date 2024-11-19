import { NextResponse } from 'next/server'
import { DatabaseError, UniqueConstraintError } from "sequelize"
import { getServerSession } from 'next-auth'
import authOptions from 'lib/authOption'
import createUser from 'lib/auth'
import User from 'models/user'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const users = await User.findAll({
      attributes: { exclude: ['password'] },
      order: [['id', 'asc']]
    })

    return NextResponse.json(users)
  } catch (error) {
    if (error instanceof DatabaseError) {
      const messages = "Database connection error"
      return NextResponse.json(
        { error: messages},
        { status: 500 }
      )
    }
    if (error instanceof UniqueConstraintError) {
      const messages = error.errors.map(e => e.message)
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

export async function POST(request: Request) {
  try {
    const { username, password, name } = await request.json()

    // Validate input
    if (!username || !password || !name) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      where: { username }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Username already exists' },
        { status: 400 }
      )
    }

    // Create user
    const userWithoutPassword = createUser(username, password, name)

    return NextResponse.json(userWithoutPassword, { status: 201 })
  } catch (error) {
    if (error instanceof DatabaseError) {
      const messages = "Database connection error"
      return NextResponse.json(
        { error: messages},
        { status: 500 }
      )
    }
    if (error instanceof UniqueConstraintError) {
      const messages = error.errors.map(e => e.message)
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
