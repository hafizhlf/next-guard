// app/api/register/route.ts
import { NextResponse } from 'next/server'
import { createUser } from '@/lib/auth'

export async function POST(req: Request) {
  try {
    const { username, password, name } = await req.json()

    if (!username || !password || !name) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const user = await createUser(username, password, name)
    return NextResponse.json(user)
  } catch (error) {
    return NextResponse.json(
      { error: 'Error creating user' },
      { status: 500 }
    )
  }
}