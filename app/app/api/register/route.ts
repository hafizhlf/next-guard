import { NextResponse } from 'next/server'
import createUser from 'lib/auth'
import User from 'models/user'

export async function POST(req: Request) {
  try {
    if (process.env.NEXT_PUBLIC_ENABLE_REGISTER_PAGE === 'false') {
      return NextResponse.json(
        { error: 'Registration is disabled' },
        { status: 403 }
      )
    }

    const { username, password, name } = await req.json()

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
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}