'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/db';
import { transactions, accounts, categories } from '@/db/schema';
import { eq, and, or, isNull } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

const TRANSACTION_TYPES = ['INCOME', 'EXPENSE', 'TRANSFER'];

type DbTx = Parameters<Parameters<typeof db.transaction>[0]>[0];

function validateInput(type: string, amount: number) {
  if (!TRANSACTION_TYPES.includes(type)) {
    throw new Error('Invalid transaction type');
  }
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error('Amount must be greater than zero');
  }
}

// Every referenced account must belong to the caller; a category must be a system
// category or one of the caller's own.
async function assertOwnership(
  tx: DbTx,
  userId: string,
  accountIds: (string | null | undefined)[],
  categoryId?: string | null,
) {
  for (const id of accountIds) {
    if (!id) continue;
    const [acc] = await tx
      .select({ id: accounts.id })
      .from(accounts)
      .where(and(eq(accounts.id, id), eq(accounts.userId, userId)));
    if (!acc) throw new Error('Account not found');
  }

  if (categoryId) {
    const [cat] = await tx
      .select({ id: categories.id })
      .from(categories)
      .where(
        and(
          eq(categories.id, categoryId),
          or(isNull(categories.userId), eq(categories.userId, userId)),
        ),
      );
    if (!cat) throw new Error('Category not found');
  }
}

export async function createTransaction(formData: {
  amount: number;
  type: string; // INCOME, EXPENSE, TRANSFER
  description?: string;
  date: Date;
  accountId?: string | null;
  categoryId?: string | null;
  fromAccountId?: string | null;
  toAccountId?: string | null;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  const { amount, type, description, date, accountId, categoryId, fromAccountId, toAccountId } =
    formData;

  validateInput(type, amount);

  const txId = crypto.randomUUID();

  // Run everything in a DB transaction
  await db.transaction(async (tx) => {
    await assertOwnership(tx, session.user.id, [accountId, fromAccountId, toAccountId], categoryId);

    // 1. Insert transaction record
    await tx.insert(transactions).values({
      id: txId,
      amount,
      type,
      description: description || null,
      date: new Date(date),
      userId: session.user.id,
      accountId: accountId || null,
      categoryId: categoryId || null,
      fromAccountId: fromAccountId || null,
      toAccountId: toAccountId || null,
    });

    // 2. Update account balances
    if (type === 'INCOME') {
      if (!accountId) throw new Error('Account is required for income');
      const [acc] = await tx.select().from(accounts).where(eq(accounts.id, accountId));
      if (!acc) throw new Error('Account not found');
      await tx
        .update(accounts)
        .set({ balance: acc.balance + amount })
        .where(eq(accounts.id, accountId));
    } else if (type === 'EXPENSE') {
      if (!accountId) throw new Error('Account is required for expense');
      const [acc] = await tx.select().from(accounts).where(eq(accounts.id, accountId));
      if (!acc) throw new Error('Account not found');
      await tx
        .update(accounts)
        .set({ balance: acc.balance - amount })
        .where(eq(accounts.id, accountId));
    } else if (type === 'TRANSFER') {
      if (!fromAccountId || !toAccountId) {
        throw new Error('Source and destination accounts are required for transfer');
      }
      if (fromAccountId === toAccountId) {
        throw new Error('Source and destination accounts cannot be the same');
      }

      const [fromAcc] = await tx.select().from(accounts).where(eq(accounts.id, fromAccountId));
      const [toAcc] = await tx.select().from(accounts).where(eq(accounts.id, toAccountId));

      if (!fromAcc || !toAcc) throw new Error('Accounts not found');

      // Update fromAccount (deduct)
      await tx
        .update(accounts)
        .set({ balance: fromAcc.balance - amount })
        .where(eq(accounts.id, fromAccountId));

      // Update toAccount (add)
      await tx
        .update(accounts)
        .set({ balance: toAcc.balance + amount })
        .where(eq(accounts.id, toAccountId));
    }
  });

  revalidatePath('/transactions');
  revalidatePath('/accounts');
  revalidatePath('/');
  return { success: true };
}

export async function deleteTransaction(id: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  await db.transaction(async (tx) => {
    // 1. Fetch transaction details
    const [transaction] = await tx
      .select()
      .from(transactions)
      .where(and(eq(transactions.id, id), eq(transactions.userId, session.user.id)));

    if (!transaction) {
      throw new Error('Transaction not found');
    }

    const { amount, type, accountId, fromAccountId, toAccountId } = transaction;

    // 2. Revert account balances
    if (type === 'INCOME') {
      if (accountId) {
        const [acc] = await tx.select().from(accounts).where(eq(accounts.id, accountId));
        if (acc) {
          await tx
            .update(accounts)
            .set({ balance: acc.balance - amount })
            .where(eq(accounts.id, accountId));
        }
      }
    } else if (type === 'EXPENSE') {
      if (accountId) {
        const [acc] = await tx.select().from(accounts).where(eq(accounts.id, accountId));
        if (acc) {
          await tx
            .update(accounts)
            .set({ balance: acc.balance + amount })
            .where(eq(accounts.id, accountId));
        }
      }
    } else if (type === 'TRANSFER') {
      if (fromAccountId && toAccountId) {
        const [fromAcc] = await tx.select().from(accounts).where(eq(accounts.id, fromAccountId));
        const [toAcc] = await tx.select().from(accounts).where(eq(accounts.id, toAccountId));

        if (fromAcc) {
          await tx
            .update(accounts)
            .set({ balance: fromAcc.balance + amount })
            .where(eq(accounts.id, fromAccountId));
        }

        if (toAcc) {
          await tx
            .update(accounts)
            .set({ balance: toAcc.balance - amount })
            .where(eq(accounts.id, toAccountId));
        }
      }
    }

    // 3. Delete the transaction record
    await tx.delete(transactions).where(eq(transactions.id, id));
  });

  revalidatePath('/transactions');
  revalidatePath('/accounts');
  revalidatePath('/');
  return { success: true };
}

export async function updateTransaction(
  id: string,
  formData: {
    amount: number;
    type: string; // INCOME, EXPENSE, TRANSFER
    description?: string;
    date: Date;
    accountId?: string | null;
    categoryId?: string | null;
    fromAccountId?: string | null;
    toAccountId?: string | null;
  },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  const { amount, type, description, date, accountId, categoryId, fromAccountId, toAccountId } =
    formData;

  validateInput(type, amount);

  await db.transaction(async (tx) => {
    await assertOwnership(tx, session.user.id, [accountId, fromAccountId, toAccountId], categoryId);

    // 1. Fetch the OLD transaction details
    const [oldTx] = await tx
      .select()
      .from(transactions)
      .where(and(eq(transactions.id, id), eq(transactions.userId, session.user.id)));

    if (!oldTx) {
      throw new Error('Transaction not found');
    }

    // 2. Revert OLD balances
    if (oldTx.type === 'INCOME') {
      if (oldTx.accountId) {
        const [acc] = await tx.select().from(accounts).where(eq(accounts.id, oldTx.accountId));
        if (acc) {
          await tx
            .update(accounts)
            .set({ balance: acc.balance - oldTx.amount })
            .where(eq(accounts.id, oldTx.accountId));
        }
      }
    } else if (oldTx.type === 'EXPENSE') {
      if (oldTx.accountId) {
        const [acc] = await tx.select().from(accounts).where(eq(accounts.id, oldTx.accountId));
        if (acc) {
          await tx
            .update(accounts)
            .set({ balance: acc.balance + oldTx.amount })
            .where(eq(accounts.id, oldTx.accountId));
        }
      }
    } else if (oldTx.type === 'TRANSFER') {
      if (oldTx.fromAccountId && oldTx.toAccountId) {
        const [fromAcc] = await tx
          .select()
          .from(accounts)
          .where(eq(accounts.id, oldTx.fromAccountId));
        const [toAcc] = await tx.select().from(accounts).where(eq(accounts.id, oldTx.toAccountId));
        if (fromAcc) {
          await tx
            .update(accounts)
            .set({ balance: fromAcc.balance + oldTx.amount })
            .where(eq(accounts.id, oldTx.fromAccountId));
        }
        if (toAcc) {
          await tx
            .update(accounts)
            .set({ balance: toAcc.balance - oldTx.amount })
            .where(eq(accounts.id, oldTx.toAccountId));
        }
      }
    }

    // 3. Apply NEW balances
    if (type === 'INCOME') {
      if (!accountId) throw new Error('Account is required for income');
      const [acc] = await tx.select().from(accounts).where(eq(accounts.id, accountId));
      if (!acc) throw new Error('Account not found');
      await tx
        .update(accounts)
        .set({ balance: acc.balance + amount })
        .where(eq(accounts.id, accountId));
    } else if (type === 'EXPENSE') {
      if (!accountId) throw new Error('Account is required for expense');
      const [acc] = await tx.select().from(accounts).where(eq(accounts.id, accountId));
      if (!acc) throw new Error('Account not found');
      await tx
        .update(accounts)
        .set({ balance: acc.balance - amount })
        .where(eq(accounts.id, accountId));
    } else if (type === 'TRANSFER') {
      if (!fromAccountId || !toAccountId) {
        throw new Error('Source and destination accounts are required for transfer');
      }
      if (fromAccountId === toAccountId) {
        throw new Error('Source and destination accounts cannot be the same');
      }
      const [fromAcc] = await tx.select().from(accounts).where(eq(accounts.id, fromAccountId));
      const [toAcc] = await tx.select().from(accounts).where(eq(accounts.id, toAccountId));
      if (!fromAcc || !toAcc) throw new Error('Accounts not found');

      await tx
        .update(accounts)
        .set({ balance: fromAcc.balance - amount })
        .where(eq(accounts.id, fromAccountId));
      await tx
        .update(accounts)
        .set({ balance: toAcc.balance + amount })
        .where(eq(accounts.id, toAccountId));
    }

    // 4. Update the transaction record
    await tx
      .update(transactions)
      .set({
        amount,
        type,
        description: description || null,
        date: new Date(date),
        accountId: type !== 'TRANSFER' ? accountId : null,
        categoryId: type !== 'TRANSFER' ? categoryId : null,
        fromAccountId: type === 'TRANSFER' ? fromAccountId : null,
        toAccountId: type === 'TRANSFER' ? toAccountId : null,
      })
      .where(eq(transactions.id, id));
  });

  revalidatePath('/transactions');
  revalidatePath('/accounts');
  revalidatePath('/');
  return { success: true };
}
