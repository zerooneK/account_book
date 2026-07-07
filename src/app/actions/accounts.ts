'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/db';
import { accounts } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function getAccounts() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  return db.select().from(accounts).where(eq(accounts.userId, session.user.id));
}

export async function createAccount(formData: { name: string; type: string; balance: number }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  const { name, type, balance } = formData;
  if (!name || !type) {
    throw new Error('Name and type are required');
  }

  const accountId = crypto.randomUUID();

  await db.insert(accounts).values({
    id: accountId,
    name,
    type,
    balance: balance || 0,
    userId: session.user.id,
  });

  revalidatePath('/accounts');
  revalidatePath('/');
  return { success: true };
}

export async function updateAccount(
  id: string,
  formData: { name: string; type: string; balance?: number },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  const { name, type, balance } = formData;
  if (!name || !type) {
    throw new Error('Name and type are required');
  }

  const updateData: { name: string; type: string; balance?: number } = {
    name,
    type,
  };

  if (balance !== undefined) {
    updateData.balance = balance;
  }

  await db
    .update(accounts)
    .set(updateData)
    .where(and(eq(accounts.id, id), eq(accounts.userId, session.user.id)));

  revalidatePath('/accounts');
  revalidatePath('/');
  return { success: true };
}

export async function deleteAccount(id: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  await db.delete(accounts).where(and(eq(accounts.id, id), eq(accounts.userId, session.user.id)));

  revalidatePath('/accounts');
  revalidatePath('/');
  return { success: true };
}
