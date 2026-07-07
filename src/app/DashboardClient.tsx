'use client';

import React from 'react';
import Link from 'next/link';

type Account = {
  id: string;
  name: string;
  type: string;
  balance: number;
  userId: string;
  createdAt: Date | null;
};

type Category = {
  id: string;
  name: string;
  type: string;
  color: string | null;
  icon: string | null;
  userId: string | null;
  createdAt: Date | null;
};

type TransactionWithRelations = {
  id: string;
  amount: number;
  type: string;
  description: string | null;
  date: Date;
  userId: string;
  accountId: string | null;
  categoryId: string | null;
  fromAccountId: string | null;
  toAccountId: string | null;
  createdAt: Date | null;
  account: Account | null;
  category: Category | null;
  fromAccount: Account | null;
  toAccount: Account | null;
};

type DashboardClientProps = {
  accounts: Account[];
  recentTransactions: TransactionWithRelations[];
  monthlyTransactions: (Omit<TransactionWithRelations, 'account' | 'fromAccount' | 'toAccount'> & {
    category: Category | null;
  })[];
};

export function DashboardClient({
  accounts,
  recentTransactions,
  monthlyTransactions,
}: DashboardClientProps) {
  // ── 1. Calculate Summary Stats ──
  const netWorth = accounts.reduce((acc, curr) => {
    if (curr.type === 'CREDIT_CARD') {
      return acc - curr.balance; // Credit card is debt/liability
    }
    return acc + curr.balance;
  }, 0);

  const monthlyIncome = monthlyTransactions
    .filter((tx) => tx.type === 'INCOME')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const monthlyExpense = monthlyTransactions
    .filter((tx) => tx.type === 'EXPENSE')
    .reduce((acc, curr) => acc + curr.amount, 0);

  // ── 2. Calculate Category Breakdown for Expenses ──
  const expenseByCategory: { [key: string]: { name: string; amount: number; color: string } } = {};
  monthlyTransactions
    .filter((tx) => tx.type === 'EXPENSE')
    .forEach((tx) => {
      const catId = tx.categoryId || 'uncategorized';
      const catName = tx.category?.name || 'Uncategorized';
      const catColor = tx.category?.color || '#6b7280';

      if (!expenseByCategory[catId]) {
        expenseByCategory[catId] = { name: catName, amount: 0, color: catColor };
      }
      expenseByCategory[catId].amount += tx.amount;
    });

  const categoryBreakdown = Object.values(expenseByCategory).sort((a, b) => b.amount - a.amount);
  const totalExpenseForBreakdown = categoryBreakdown.reduce((acc, curr) => acc + curr.amount, 0);

  // ── Helpers for Formatting ──
  const formatCurrency = (val: number) => {
    return val.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const formatDate = (dateVal: Date | string) => {
    const d = new Date(dateVal);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 w-full space-y-8">
      {/* Welcome Title */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-slate-100 to-slate-400 bg-clip-text text-transparent">
          Financial Dashboard
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Overview of your asset balances and monthly progress
        </p>
      </div>

      {/* ── Summary Cards Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Net Balance Card */}
        <div className="bg-gradient-to-br from-slate-900/60 to-slate-950/80 border border-slate-900 rounded-3xl p-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-sky-500/5 to-transparent rounded-bl-full pointer-events-none" />
          <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">
            Total Net Balance
          </span>
          <p className="text-3xl font-black text-slate-100 font-mono mt-2 tracking-tight">
            {formatCurrency(netWorth)}{' '}
            <span className="text-sky-400 text-base font-bold font-sans">THB</span>
          </p>
          <div className="mt-4 text-xs text-slate-400 flex items-center gap-1.5">
            <span>Across {accounts.length} active accounts</span>
          </div>
        </div>

        {/* Monthly Income Card */}
        <div className="bg-gradient-to-br from-slate-900/60 to-slate-950/80 border border-slate-900 rounded-3xl p-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-emerald-500/5 to-transparent rounded-bl-full pointer-events-none" />
          <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">
            This Month Income
          </span>
          <p className="text-3xl font-black text-emerald-400 font-mono mt-2 tracking-tight">
            +{formatCurrency(monthlyIncome)}{' '}
            <span className="text-emerald-500 text-base font-bold font-sans">THB</span>
          </p>
          <div className="mt-4 text-xs text-slate-400 flex items-center gap-1">
            <span className="text-emerald-500">💰</span>
            <span>Monthly inflows total</span>
          </div>
        </div>

        {/* Monthly Expense Card */}
        <div className="bg-gradient-to-br from-slate-900/60 to-slate-950/80 border border-slate-900 rounded-3xl p-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-rose-500/5 to-transparent rounded-bl-full pointer-events-none" />
          <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">
            This Month Expense
          </span>
          <p className="text-3xl font-black text-rose-400 font-mono mt-2 tracking-tight">
            -{formatCurrency(monthlyExpense)}{' '}
            <span className="text-rose-500 text-base font-bold font-sans">THB</span>
          </p>
          <div className="mt-4 text-xs text-slate-400 flex items-center gap-1">
            <span className="text-rose-500">📉</span>
            <span>Monthly outflows total</span>
          </div>
        </div>
      </div>

      {/* ── Main Dashboard Layout Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Recent Transactions (Span 2) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900/40 border border-slate-900 rounded-3xl p-6 shadow-lg backdrop-blur-sm">
            <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-950">
              <h2 className="text-lg font-bold text-slate-100">Recent Transactions</h2>
              <Link
                href="/transactions"
                className="text-xs font-semibold text-sky-400 hover:text-sky-300 transition-colors"
              >
                View All &rarr;
              </Link>
            </div>

            {recentTransactions.length === 0 ? (
              <div className="text-center py-16">
                <span className="text-3xl block mb-3">📝</span>
                <p className="text-slate-400 text-sm">No recent transactions logged</p>
                <Link
                  href="/transactions"
                  className="mt-4 inline-block text-xs font-semibold px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 transition-all"
                >
                  Create First Record
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-slate-950">
                {recentTransactions.map((tx) => {
                  const isIncome = tx.type === 'INCOME';
                  const isExpense = tx.type === 'EXPENSE';
                  const isTransfer = tx.type === 'TRANSFER';

                  return (
                    <div key={tx.id} className="py-4 flex items-center justify-between gap-4">
                      {/* Left: Type / Info */}
                      <div className="flex items-center gap-3">
                        <span className="text-lg p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/40">
                          {isIncome && '💰'}
                          {isExpense && '📉'}
                          {isTransfer && '⇄'}
                        </span>
                        <div>
                          <p className="font-bold text-slate-100 text-sm sm:text-base leading-tight">
                            {tx.description || tx.category?.name || 'No Description'}
                          </p>
                          <span className="text-xs text-slate-500 font-medium">
                            {formatDate(tx.date)}
                            {tx.category && ` • ${tx.category.name}`}
                          </span>
                        </div>
                      </div>

                      {/* Right: Balance adjustments */}
                      <div className="text-right">
                        <p
                          className={`font-mono font-bold text-sm sm:text-base ${
                            isIncome
                              ? 'text-emerald-400'
                              : isExpense
                                ? 'text-rose-400'
                                : 'text-sky-400'
                          }`}
                        >
                          {isIncome && '+'}
                          {isExpense && '-'}
                          {formatCurrency(tx.amount)} THB
                        </p>
                        <p className="text-2xs text-slate-500 font-medium mt-0.5">
                          {isTransfer ? (
                            <span>
                              {tx.fromAccount?.name} &rarr; {tx.toAccount?.name}
                            </span>
                          ) : (
                            <span>Account: {tx.account?.name}</span>
                          )}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Category Breakdown & Actions (Span 1) */}
        <div className="space-y-6">
          {/* Quick Actions Card */}
          <div className="bg-slate-900/40 border border-slate-900 rounded-3xl p-6 shadow-lg backdrop-blur-sm">
            <h2 className="text-lg font-bold text-slate-100 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3">
              <Link
                href="/transactions"
                className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-950/50 border border-slate-800 hover:border-sky-500/40 hover:bg-slate-900/50 transition-all text-center group cursor-pointer"
              >
                <span className="text-2xl mb-1.5 transition-transform group-hover:scale-110 duration-200">
                  📝
                </span>
                <span className="text-xs font-semibold text-slate-300">Add Record</span>
              </Link>
              <Link
                href="/accounts"
                className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-950/50 border border-slate-800 hover:border-indigo-500/40 hover:bg-slate-900/50 transition-all text-center group cursor-pointer"
              >
                <span className="text-2xl mb-1.5 transition-transform group-hover:scale-110 duration-200">
                  🏦
                </span>
                <span className="text-xs font-semibold text-slate-300">New Account</span>
              </Link>
              <Link
                href="/categories"
                className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-950/50 border border-slate-800 hover:border-emerald-500/40 hover:bg-slate-900/50 transition-all text-center group cursor-pointer"
              >
                <span className="text-2xl mb-1.5 transition-transform group-hover:scale-110 duration-200">
                  🏷️
                </span>
                <span className="text-xs font-semibold text-slate-300">Categories</span>
              </Link>
              <Link
                href="/transactions?type=TRANSFER"
                className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-950/50 border border-slate-800 hover:border-amber-500/40 hover:bg-slate-900/50 transition-all text-center group cursor-pointer"
              >
                <span className="text-2xl mb-1.5 transition-transform group-hover:scale-110 duration-200">
                  ⇄
                </span>
                <span className="text-xs font-semibold text-slate-300">Transfer</span>
              </Link>
            </div>
          </div>

          {/* Spending Category Breakdown Card */}
          <div className="bg-slate-900/40 border border-slate-900 rounded-3xl p-6 shadow-lg backdrop-blur-sm">
            <h2 className="text-lg font-bold text-slate-100 mb-4">Expense by Category</h2>

            {categoryBreakdown.length === 0 ? (
              <div className="text-center py-10">
                <span className="text-2xl block mb-2">📊</span>
                <p className="text-slate-500 text-xs">No expenses registered this month</p>
              </div>
            ) : (
              <div className="space-y-4">
                {categoryBreakdown.map((cat, idx) => {
                  const percentage =
                    totalExpenseForBreakdown > 0
                      ? (cat.amount / totalExpenseForBreakdown) * 100
                      : 0;

                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-medium">
                        <span className="text-slate-300 flex items-center gap-1.5">
                          <span
                            className="w-2.5 h-2.5 rounded-full inline-block"
                            style={{ backgroundColor: cat.color }}
                          />
                          {cat.name}
                        </span>
                        <span className="text-slate-400 font-mono">
                          {formatCurrency(cat.amount)} THB ({Math.round(percentage)}%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${percentage}%`,
                            backgroundColor: cat.color,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
