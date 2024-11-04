// app/api/users/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectDatabase } from '@/lib/db';
import models from '@/models';

export async function GET() {
  try {
    // Check authentication
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDatabase();

    // Get all users, excluding their passwords
    const users = await models.User.findAll({
      attributes: { exclude: ['password'] },
      order: [['id', 'asc']]
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}