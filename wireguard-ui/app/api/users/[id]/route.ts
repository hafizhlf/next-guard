// app/api/users/[id]/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import bcrypt from 'bcryptjs'
import { connectDatabase } from '@/lib/db'
import models from '@/models'

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const userId = params.id
    const data = await request.json()
    const { name, password } = data

    await connectDatabase()

    // Find user
    const user = await models.User.findByPk(userId)
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Prepare update data
    const updateData: { name?: string; password?: string } = {}

    if (name) {
      updateData.name = name
    }

    if (password) {
      updateData.password = await bcrypt.hash(password, 10)
    }

    // Update user
    await user.update(updateData)

    // Return updated user without password
    const { password: _, ...userWithoutPassword } = user.get({ plain: true });

    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const userId = params.id;

    if (session.user.id === userId) {
      return NextResponse.json(
        { error: 'You cannot delete your own data.' },
        { status: 403 }
      )
    }

    await connectDatabase();

    // Find user
    const user = await models.User.findByPk(userId);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Delete user
    user.destroy()
    return NextResponse.json(
      { message: 'User deleted successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}