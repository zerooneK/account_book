import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { db } from '@/db';
import { accounts, categories, transactions } from '@/db/schema';
import { eq, or, isNull, desc } from 'drizzle-orm';
import { TransactionsClient } from './TransactionsClient';

export default async function TransactionsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect('/auth/signin');
  }

  const userId = session.user.id;

  // 1. Fetch user accounts
  const userAccounts = await db.select().from(accounts).where(eq(accounts.userId, userId));

  // 2. Fetch both custom and default categories
  const userCategories = await db
    .select()
    .from(categories)
    .where(or(isNull(categories.userId), eq(categories.userId, userId)));

  // 3. Fetch all user transactions
  const userTransactions = await db.query.transactions.findMany({
    where: eq(transactions.userId, userId),
    orderBy: [desc(transactions.date)],
    with: {
      account: true,
      category: true,
      fromAccount: true,
      toAccount: true,
    },
  });

  return (
    <TransactionsClient
      initialTransactions={userTransactions}
      accounts={userAccounts}
      categories={userCategories}
    />
  );
}
