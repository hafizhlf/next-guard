import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import User from '@/models/user';

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

    // Get all users, excluding their passwords
    const users = await User.findAll({
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