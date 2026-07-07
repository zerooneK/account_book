import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { db } from '@/db';
import { accounts, transactions } from '@/db/schema';
import { eq, and, desc, gte } from 'drizzle-orm';
import { DashboardClient } from './DashboardClient';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect('/auth/signin');
  }

  const userId = session.user.id;

  // 1. Fetch user accounts
  const userAccounts = await db.select().from(accounts).where(eq(accounts.userId, userId));

  // 2. Fetch current month start date
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // 3. Fetch recent 5 transactions
  const recentTransactions = await db.query.transactions.findMany({
    where: eq(transactions.userId, userId),
    orderBy: [desc(transactions.date)],
    limit: 5,
    with: {
      account: true,
      category: true,
      fromAccount: true,
      toAccount: true,
    },
  });

  // 4. Fetch all current month transactions for stats
  const monthlyTransactions = await db.query.transactions.findMany({
    where: and(eq(transactions.userId, userId), gte(transactions.date, startOfMonth)),
    with: {
      category: true,
    },
  });

  return (
    <DashboardClient
      accounts={userAccounts}
      recentTransactions={recentTransactions}
      monthlyTransactions={monthlyTransactions}
    />
  );
}
