'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';

// Check if current user is an Admin
async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== 'ADMIN') {
    throw new Error('Forbidden: Admin access required');
  }
  return session.user.id;
}

export async function getUsers() {
  await requireAdmin();

  // Return all users ordered by createdAt or email
  return db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      role: users.role,
      createdAt: users.createdAt,
    })
    .from(users);
}

export async function createAdminUser(formData: {
  email: string;
  password: string;
  name?: string;
  role: string;
}) {
  await requireAdmin();

  const { email, password, name, role } = formData;

  if (!email || !password) {
    throw new Error('Email and password are required');
  }

  if (password.length < 6) {
    throw new Error('Password must be at least 6 characters');
  }

  // Check if email already exists
  const [existingUser] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (existingUser) {
    throw new Error('Email is already registered');
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const userId = crypto.randomUUID();

  await db.insert(users).values({
    id: userId,
    email,
    passwordHash,
    name: name || null,
    role: role === 'ADMIN' ? 'ADMIN' : 'USER',
  });

  revalidatePath('/admin');
  return { success: true };
}

export async function deleteUser(id: string) {
  const currentUserId = await requireAdmin();

  if (id === currentUserId) {
    throw new Error('You cannot delete your own admin account');
  }

  // Delete user (Drizzle schema constraints onDelete: cascade will delete all associated data!)
  await db.delete(users).where(eq(users.id, id));

  revalidatePath('/admin');
  return { success: true };
}
