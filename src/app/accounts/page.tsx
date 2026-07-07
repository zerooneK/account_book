import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { db } from '@/db';
import { accounts } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { AccountsClient } from './AccountsClient';

export default async function AccountsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect('/auth/signin');
  }

  const userAccounts = await db.select().from(accounts).where(eq(accounts.userId, session.user.id));

  return <AccountsClient initialAccounts={userAccounts} />;
}
