import { describe, it, expect, beforeAll, beforeEach, vi } from 'vitest';
import { getServerSession } from 'next-auth';
import { migrate } from 'drizzle-orm/libsql/migrator';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { clearDb } from '@/lib/test-db';
import { users, accounts, categories, transactions } from '@/db/schema';
import {
  createTransaction,
  updateTransaction,
  deleteTransaction,
} from '@/app/actions/transactions';
import { getUsers, deleteUser } from '@/app/actions/admin';

vi.mock('next-auth', () => ({ getServerSession: vi.fn() }));
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));
vi.mock('@/lib/auth', () => ({ authOptions: {} }));
vi.mock('@/db', async () => {
  const { createTestDb } = await import('@/lib/test-db');
  return { db: createTestDb('file:actions-test.db') };
});

const signInAs = (id: string, role = 'USER') =>
  vi.mocked(getServerSession).mockResolvedValue({ user: { id, role } } as never);

const balanceOf = async (id: string) => {
  const [acc] = await db.select().from(accounts).where(eq(accounts.id, id));
  return acc.balance;
};

const input = (over: Partial<Parameters<typeof createTransaction>[0]> = {}) => ({
  amount: 100,
  type: 'INCOME',
  date: new Date(),
  accountId: 'alice-wallet',
  ...over,
});

describe('transaction server actions', () => {
  beforeAll(async () => {
    await migrate(db, { migrationsFolder: './drizzle' });
  });

  beforeEach(async () => {
    await clearDb(db);
    await db.insert(users).values([
      { id: 'alice', email: 'alice@example.com', passwordHash: 'x' },
      { id: 'bob', email: 'bob@example.com', passwordHash: 'x' },
    ]);
    await db.insert(accounts).values([
      { id: 'alice-wallet', name: 'Wallet', type: 'CASH', balance: 1000, userId: 'alice' },
      { id: 'alice-bank', name: 'Bank', type: 'BANK', balance: 500, userId: 'alice' },
      { id: 'bob-wallet', name: 'Wallet', type: 'CASH', balance: 1000, userId: 'bob' },
    ]);
    await db.insert(categories).values([
      { id: 'sys-food', name: 'Food', type: 'EXPENSE', userId: null },
      { id: 'bob-cat', name: 'Private', type: 'EXPENSE', userId: 'bob' },
    ]);
    signInAs('alice');
  });

  it('rejects unauthenticated callers', async () => {
    vi.mocked(getServerSession).mockResolvedValue(null);
    await expect(createTransaction(input())).rejects.toThrow('Unauthorized');
  });

  it('applies income, expense and transfer to balances', async () => {
    await createTransaction(input({ amount: 200 }));
    expect(await balanceOf('alice-wallet')).toBe(1200);

    await createTransaction(input({ amount: 50, type: 'EXPENSE', categoryId: 'sys-food' }));
    expect(await balanceOf('alice-wallet')).toBe(1150);

    await createTransaction({
      amount: 150,
      type: 'TRANSFER',
      date: new Date(),
      fromAccountId: 'alice-wallet',
      toAccountId: 'alice-bank',
    });
    expect(await balanceOf('alice-wallet')).toBe(1000);
    expect(await balanceOf('alice-bank')).toBe(650);
  });

  it('reverts the balance when a transaction is deleted', async () => {
    await createTransaction(input({ amount: 300, type: 'EXPENSE' }));
    const [row] = await db.select().from(transactions);
    expect(await balanceOf('alice-wallet')).toBe(700);

    await deleteTransaction(row.id);
    expect(await balanceOf('alice-wallet')).toBe(1000);
  });

  it('reverts old balances and applies new ones on update', async () => {
    await createTransaction(input({ amount: 100 }));
    const [row] = await db.select().from(transactions);

    await updateTransaction(
      row.id,
      input({ amount: 40, type: 'EXPENSE', accountId: 'alice-bank' }),
    );

    expect(await balanceOf('alice-wallet')).toBe(1000);
    expect(await balanceOf('alice-bank')).toBe(460);
  });

  it("refuses to touch another user's account", async () => {
    await expect(createTransaction(input({ accountId: 'bob-wallet' }))).rejects.toThrow(
      'Account not found',
    );
    await expect(
      createTransaction({
        amount: 500,
        type: 'TRANSFER',
        date: new Date(),
        fromAccountId: 'bob-wallet',
        toAccountId: 'alice-wallet',
      }),
    ).rejects.toThrow('Account not found');

    expect(await balanceOf('bob-wallet')).toBe(1000);
    expect(await balanceOf('alice-wallet')).toBe(1000);
    expect(await db.select().from(transactions)).toHaveLength(0);
  });

  it("refuses to move a transaction onto another user's account via update", async () => {
    await createTransaction(input({ amount: 100 }));
    const [row] = await db.select().from(transactions);

    await expect(updateTransaction(row.id, input({ accountId: 'bob-wallet' }))).rejects.toThrow(
      'Account not found',
    );
    expect(await balanceOf('alice-wallet')).toBe(1100);
    expect(await balanceOf('bob-wallet')).toBe(1000);
  });

  it("refuses another user's category but accepts system categories", async () => {
    await expect(
      createTransaction(input({ type: 'EXPENSE', categoryId: 'bob-cat' })),
    ).rejects.toThrow('Category not found');
    await expect(
      createTransaction(input({ type: 'EXPENSE', categoryId: 'sys-food' })),
    ).resolves.toEqual({ success: true });
  });

  it('validates the transaction type and amount', async () => {
    await expect(createTransaction(input({ type: 'GIFT' }))).rejects.toThrow(
      'Invalid transaction type',
    );
    for (const amount of [0, -5, NaN, Infinity]) {
      await expect(createTransaction(input({ amount }))).rejects.toThrow(
        'Amount must be greater than zero',
      );
    }
    expect(await balanceOf('alice-wallet')).toBe(1000);
  });
});

describe('admin server actions', () => {
  beforeEach(async () => {
    await clearDb(db);
    await db.insert(users).values([
      { id: 'admin', email: 'admin@example.com', passwordHash: 'x', role: 'ADMIN' },
      { id: 'carol', email: 'carol@example.com', passwordHash: 'x' },
    ]);
  });

  it('blocks non-admins', async () => {
    signInAs('carol', 'USER');
    await expect(getUsers()).rejects.toThrow('Forbidden');
    await expect(deleteUser('admin')).rejects.toThrow('Forbidden');
  });

  it('stops an admin from deleting their own account', async () => {
    signInAs('admin', 'ADMIN');
    await expect(deleteUser('admin')).rejects.toThrow('You cannot delete your own admin account');
    expect(await db.select().from(users).where(eq(users.id, 'admin'))).toHaveLength(1);
  });

  it('lets an admin delete another user', async () => {
    signInAs('admin', 'ADMIN');
    await deleteUser('carol');
    expect(await db.select().from(users).where(eq(users.id, 'carol'))).toHaveLength(0);
  });
});
