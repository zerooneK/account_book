import { NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const { email, password, name } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 },
      );
    }

    // Check if user exists
    const existingUsers = await db.select().from(users).where(eq(users.email, email)).limit(1);

    if (existingUsers.length > 0) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 400 });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);
    const userId = crypto.randomUUID();

    // Insert user
    await db.insert(users).values({
      id: userId,
      email,
      passwordHash,
      name: name || null,
    });

    return NextResponse.json({ message: 'User registered successfully', userId }, { status: 201 });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Something went wrong during registration' },
      { status: 500 },
    );
  }
}
