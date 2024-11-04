// app/api/register/route.ts
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectDatabase } from '@/lib/db';
import models from '@/models';

export async function POST(req: Request) {
  try {
    await connectDatabase();
    
    const { username, password, name } = await req.json();

    // Validate input
    if (!username || !password || !name) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await models.User.findOne({
      where: { username }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Username already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await models.User.create({
      username,
      password: hashedPassword,
      name,
    });

    // Return user data (excluding password)
    const { password: _, ...userWithoutPassword } = user.get();
    
    return NextResponse.json(userWithoutPassword, { status: 201 });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}