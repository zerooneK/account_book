import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import * as schema from './schema';
import { categories } from './schema';
import { isNull, eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

const client = createClient({
  url: process.env.DATABASE_URL || 'file:local.db',
});
const db = drizzle(client, { schema });

const defaultCategories = [
  { id: 'sys-inc-salary', name: 'Salary', type: 'INCOME', color: '#10b981', icon: '💼' },
  { id: 'sys-inc-invest', name: 'Investments', type: 'INCOME', color: '#3b82f6', icon: '📈' },
  { id: 'sys-inc-other', name: 'Others (Income)', type: 'INCOME', color: '#6b7280', icon: '🪙' },
  { id: 'sys-exp-food', name: 'Food & Dining', type: 'EXPENSE', color: '#ef4444', icon: '🍔' },
  { id: 'sys-exp-transport', name: 'Transport', type: 'EXPENSE', color: '#f59e0b', icon: '🚗' },
  { id: 'sys-exp-shopping', name: 'Shopping', type: 'EXPENSE', color: '#ec4899', icon: '🛍️' },
  {
    id: 'sys-exp-entertainment',
    name: 'Entertainment',
    type: 'EXPENSE',
    color: '#8b5cf6',
    icon: '🎬',
  },
  { id: 'sys-exp-utilities', name: 'Utilities', type: 'EXPENSE', color: '#06b6d4', icon: '💡' },
  { id: 'sys-exp-other', name: 'Others (Expense)', type: 'EXPENSE', color: '#6b7280', icon: '💸' },
];

async function seed() {
  // Seed Admin user
  console.log('Seeding Admin user...');
  const adminEmail = 'admin@accountbook.com';
  const existingAdmin = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.email, adminEmail));

  if (existingAdmin.length === 0) {
    const passwordHash = await bcrypt.hash('admin123456', 10);
    await db.insert(schema.users).values({
      id: 'sys-admin-user',
      email: adminEmail,
      passwordHash,
      name: 'System Admin',
      role: 'ADMIN',
    });
    console.log('Admin user seeded successfully!');
  } else {
    await db.update(schema.users).set({ role: 'ADMIN' }).where(eq(schema.users.email, adminEmail));
    console.log('Admin user already exists, verified ADMIN role.');
  }

  console.log('Clearing old system categories...');
  await db.delete(categories).where(isNull(categories.userId));

  console.log('Seeding default categories...');
  for (const cat of defaultCategories) {
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
