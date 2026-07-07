'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/db';
import { categories } from '@/db/schema';
import { eq, and, or, isNull } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function getCategories() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  // Fetch both system categories (userId is null) and user's custom categories
  return db
    .select()
    .from(categories)
    .where(or(isNull(categories.userId), eq(categories.userId, session.user.id)));
}

export async function createCategory(formData: {
  name: string;
  type: string;
  color?: string;
  icon?: string;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  const { name, type, color, icon } = formData;
  if (!name || !type) {
    throw new Error('Name and type are required');
  }

  const categoryId = crypto.randomUUID();

  await db.insert(categories).values({
    id: categoryId,
    name,
    type,
    color: color || '#6b7280',
    icon: icon || 'Tag',
    userId: session.user.id,
  });

  revalidatePath('/categories');
  revalidatePath('/');
  return { success: true };
}

export async function deleteCategory(id: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  // A user can only delete their own custom categories, not system categories!
  await db
    .delete(categories)
    .where(and(eq(categories.id, id), eq(categories.userId, session.user.id)));

  revalidatePath('/categories');
  revalidatePath('/');
  return { success: true };
}
