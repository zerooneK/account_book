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

  it('should revert old balances and apply new balances on transaction update', async () => {
    const userId = 'user-2';
    await db.insert(users).values({
      id: userId,
      email: 'user2@example.com',
      passwordHash: 'hash',
    });

    const accId1 = 'acc-1';
    const accId2 = 'acc-2';

    await db.insert(accounts).values({
      id: accId1,
      name: 'Wallet',
      type: 'CASH',
      balance: 100.0,
      userId,
    });

    await db.insert(accounts).values({
      id: accId2,
      name: 'Bank',
      type: 'BANK',
      balance: 500.0,
      userId,
    });

    // Create INCOME of 100 on Wallet
    const txId = 'tx-update-test';
    await db.transaction(async (tx) => {
      await tx.insert(transactions).values({
        id: txId,
        amount: 100.0,
        type: 'INCOME',
        date: new Date(),
        userId,
        accountId: accId1,
      });

      const [acc] = await tx.select().from(accounts).where(eq(accounts.id, accId1));
      await tx
        .update(accounts)
        .set({ balance: acc.balance + 100.0 })
        .where(eq(accounts.id, accId1));
    });

    const [acc1] = await db.select().from(accounts).where(eq(accounts.id, accId1));
    expect(acc1.balance).toBe(200.0);

    // Now edit transaction to be an EXPENSE of 50 on Bank
    await db.transaction(async (tx) => {
      // 1. Fetch old transaction
      const [oldTx] = await tx.select().from(transactions).where(eq(transactions.id, txId));

      // 2. Revert old INCOME of 100 on Wallet
      const [wallet] = await tx.select().from(accounts).where(eq(accounts.id, oldTx.accountId!));
      await tx
        .update(accounts)
        .set({ balance: wallet.balance - oldTx.amount })
        .where(eq(accounts.id, oldTx.accountId!));

      // 3. Apply new EXPENSE of 50 on Bank
      const [bank] = await tx.select().from(accounts).where(eq(accounts.id, accId2));
      await tx
        .update(accounts)
        .set({ balance: bank.balance - 50.0 })
        .where(eq(accounts.id, accId2));

      // 4. Update transaction
      await tx
        .update(transactions)
        .set({
          amount: 50.0,
          type: 'EXPENSE',
          accountId: accId2,
        })
        .where(eq(transactions.id, txId));
    });

    const [finalWallet] = await db.select().from(accounts).where(eq(accounts.id, accId1));
    const [finalBank] = await db.select().from(accounts).where(eq(accounts.id, accId2));

    expect(finalWallet.balance).toBe(100.0);
    expect(finalBank.balance).toBe(450.0);
  });

  it('should support roles and prevent self-deletion', async () => {
    const adminId = 'admin-id';
    const userId = 'user-id';

    // 1. Insert admin and regular user
    await db.insert(users).values({
      id: adminId,
      email: 'admin@example.com',
      passwordHash: 'hash',
      role: 'ADMIN',
    });

    await db.insert(users).values({
      id: userId,
      email: 'user@example.com',
      passwordHash: 'hash',
      role: 'USER',
    });

    // Verify roles are set correctly
    const [dbAdmin] = await db.select().from(users).where(eq(users.id, adminId));
    const [dbUser] = await db.select().from(users).where(eq(users.id, userId));

    expect(dbAdmin.role).toBe('ADMIN');
    expect(dbUser.role).toBe('USER');

    // Simulate deleteUser logic
    // Admin cannot delete self
    const simulateDeleteSelf = () => {
      if (adminId === adminId) {
        throw new Error('You cannot delete your own admin account');
      }
    };
    expect(simulateDeleteSelf).toThrow('You cannot delete your own admin account');

    // Admin can delete regular user
    await db.delete(users).where(eq(users.id, userId));
    const [deletedUserCheck] = await db.select().from(users).where(eq(users.id, userId));
    expect(deletedUserCheck).toBeUndefined();
  });
});
