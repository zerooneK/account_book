import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import * as schema from './schema';
import { categories } from './schema';
import { eq, isNull, and } from 'drizzle-orm';

const client = createClient({
  url: process.env.DATABASE_URL || 'file:local.db',
});
const db = drizzle(client, { schema });

const defaultCategories = [
  { id: 'sys-inc-salary', name: 'Salary', type: 'INCOME', color: '#10b981', icon: 'Briefcase' },
  {
    id: 'sys-inc-invest',
    name: 'Investments',
    type: 'INCOME',
    color: '#3b82f6',
    icon: 'TrendingUp',
  },
  {
    id: 'sys-inc-other',
    name: 'Others (Income)',
    type: 'INCOME',
    color: '#6b7280',
    icon: 'PlusCircle',
  },
  {
    id: 'sys-exp-food',
    name: 'Food & Dining',
    type: 'EXPENSE',
    color: '#ef4444',
    icon: 'Utensils',
  },
  { id: 'sys-exp-transport', name: 'Transport', type: 'EXPENSE', color: '#f59e0b', icon: 'Car' },
  {
    id: 'sys-exp-shopping',
    name: 'Shopping',
    type: 'EXPENSE',
    color: '#ec4899',
    icon: 'ShoppingBag',
  },
  {
    id: 'sys-exp-entertainment',
    name: 'Entertainment',
    type: 'EXPENSE',
    color: '#8b5cf6',
    icon: 'Film',
  },
  { id: 'sys-exp-utilities', name: 'Utilities', type: 'EXPENSE', color: '#06b6d4', icon: 'Zap' },
  {
    id: 'sys-exp-other',
    name: 'Others (Expense)',
    type: 'EXPENSE',
    color: '#6b7280',
    icon: 'MinusCircle',
  },
];

async function seed() {
  console.log('Seeding default categories...');
  for (const cat of defaultCategories) {
    const existing = await db
      .select()
      .from(categories)
      .where(and(eq(categories.id, cat.id), isNull(categories.userId)))
      .all(); // Use .all() to get all matches in sqlite driver

    if (existing.length === 0) {
      await db.insert(categories).values({
        id: cat.id,
        name: cat.name,
        type: cat.type,
        color: cat.color,
        icon: cat.icon,
        userId: null,
      });
      console.log(`Added system category: ${cat.name}`);
    }
  }
  console.log('Seeding completed!');
}

seed()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
  });
