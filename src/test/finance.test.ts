import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import { createTestDb, clearDb } from '@/lib/test-db';
import { migrate } from 'drizzle-orm/libsql/migrator';
import { users, accounts, transactions } from '@/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { DbType } from '@/db';

let db: DbType;

describe('Finance App Integration Tests', () => {
  beforeAll(async () => {
    db = createTestDb();
    // Run migrations on the test database
    await migrate(db, { migrationsFolder: './drizzle' });
  });

  beforeEach(async () => {
    await clearDb(db);
  });

  it('should successfully register a user and hash password', async () => {
    const userId = crypto.randomUUID();
    const email = 'test@example.com';
    const rawPassword = 'password123';
    const passwordHash = await bcrypt.hash(rawPassword, 10);

    await db.insert(users).values({
      id: userId,
      email,
      passwordHash,
      name: 'Test User',
    });

    const [user] = await db.select().from(users).where(eq(users.id, userId));
    expect(user).toBeDefined();
    expect(user.email).toBe(email);
    expect(await bcrypt.compare(rawPassword, user.passwordHash)).toBe(true);
  });

  it('should handle transactions and sync account balances correctly', async () => {
    const userId = 'user-1';
    await db.insert(users).values({
      id: userId,
      email: 'user1@example.com',
      passwordHash: 'hash',
    });

    const fromAccId = 'acc-from';
    const toAccId = 'acc-to';

    // 1. Create two accounts
    await db.insert(accounts).values({
      id: fromAccId,
      name: 'Bank Account A',
      type: 'BANK',
      balance: 1000.0,
      userId,
    });

    await db.insert(accounts).values({
      id: toAccId,
      name: 'Cash Pocket',
      type: 'CASH',
      balance: 200.0,
      userId,
    });

    // 2. Perform Income transaction on Account A
    const incTxId = 'tx-inc';
    const incAmount = 500.0;
    await db.transaction(async (tx) => {
      await tx.insert(transactions).values({
        id: incTxId,
        amount: incAmount,
        type: 'INCOME',
        date: new Date(),
        userId,
        accountId: fromAccId,
      });

      const [acc] = await tx.select().from(accounts).where(eq(accounts.id, fromAccId));
      await tx
        .update(accounts)
        .set({ balance: acc.balance + incAmount })
        .where(eq(accounts.id, fromAccId));
    });

    const [updatedFromAcc] = await db.select().from(accounts).where(eq(accounts.id, fromAccId));
    expect(updatedFromAcc.balance).toBe(1500.0);

    // 3. Perform Expense transaction on Account A
    const expTxId = 'tx-exp';
    const expAmount = 300.0;
    await db.transaction(async (tx) => {
      await tx.insert(transactions).values({
        id: expTxId,
        amount: expAmount,
        type: 'EXPENSE',
        date: new Date(),
        userId,
        accountId: fromAccId,
      });

      const [acc] = await tx.select().from(accounts).where(eq(accounts.id, fromAccId));
      await tx
        .update(accounts)
        .set({ balance: acc.balance - expAmount })
        .where(eq(accounts.id, fromAccId));
    });

    const [updatedFromAcc2] = await db.select().from(accounts).where(eq(accounts.id, fromAccId));
    expect(updatedFromAcc2.balance).toBe(1200.0);

    // 4. Perform Transfer from Account A to Account B
    const transferTxId = 'tx-transfer';
    const transferAmount = 400.0;
    await db.transaction(async (tx) => {
      await tx.insert(transactions).values({
        id: transferTxId,
        amount: transferAmount,
        type: 'TRANSFER',
        date: new Date(),
        userId,
        fromAccountId: fromAccId,
        toAccountId: toAccId,
      });

      const [fromAcc] = await tx.select().from(accounts).where(eq(accounts.id, fromAccId));
      const [toAcc] = await tx.select().from(accounts).where(eq(accounts.id, toAccId));

      await tx
        .update(accounts)
        .set({ balance: fromAcc.balance - transferAmount })
        .where(eq(accounts.id, fromAccId));
      await tx
        .update(accounts)
        .set({ balance: toAcc.balance + transferAmount })
        .where(eq(accounts.id, toAccId));
    });

    const [finalFromAcc] = await db.select().from(accounts).where(eq(accounts.id, fromAccId));
    const [finalToAcc] = await db.select().from(accounts).where(eq(accounts.id, toAccId));

    expect(finalFromAcc.balance).toBe(800.0);
    expect(finalToAcc.balance).toBe(600.0);
  });
});
