import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { db } from '@/db';
import { categories } from '@/db/schema';
import { eq, or, isNull } from 'drizzle-orm';
import { CategoriesClient } from './CategoriesClient';

export default async function CategoriesPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect('/auth/signin');
  }

  const allCategories = await db
    .select()
    .from(categories)
    .where(or(isNull(categories.userId), eq(categories.userId, session.user.id)));

  return <CategoriesClient initialCategories={allCategories} />;
}
