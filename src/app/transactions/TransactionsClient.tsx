'use client';

import React, { useState } from 'react';
import { createTransaction, deleteTransaction } from '@/app/actions/transactions';

type Account = {
  id: string;
  name: string;
  type: string;
  balance: number;
};

type Category = {
  id: string;
  name: string;
  type: string;
  color: string | null;
  icon: string | null;
};

type Transaction = {
  id: string;
  amount: number;
  type: string;
  description: string | null;
  date: Date;
  accountId: string | null;
  categoryId: string | null;
  fromAccountId: string | null;
  toAccountId: string | null;
  account: Account | null;
  category: Category | null;
  fromAccount: Account | null;
  toAccount: Account | null;
};

type TransactionsClientProps = {
  initialTransactions: Transaction[];
  accounts: Account[];
  categories: Category[];
};

export function TransactionsClient({
  initialTransactions,
  accounts,
  categories,
}: TransactionsClientProps) {
  const [transactions] = useState<Transaction[]>(initialTransactions);
  const [modalOpen, setModalOpen] = useState(false);

  // Filter states
  const [filterAccount, setFilterAccount] = useState('ALL');
  const [filterType, setFilterType] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Form states
  const [type, setType] = useState('EXPENSE'); // INCOME, EXPENSE, TRANSFER
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [accountId, setAccountId] = useState(accounts[0]?.id || '');
  const [categoryId, setCategoryId] = useState('');
  const [fromAccountId, setFromAccountId] = useState(accounts[0]?.id || '');
  const [toAccountId, setToAccountId] = useState(accounts[1]?.id || accounts[0]?.id || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshPage = () => {
    window.location.reload();
  };

  const handleOpenCreate = () => {
    setAmount('');
    setDescription('');
    setDate(new Date().toISOString().split('T')[0]);
    setAccountId(accounts[0]?.id || '');
    // Select first category matching current type
    const matchingCats = categories.filter((c) => c.type === type);
    setCategoryId(matchingCats[0]?.id || '');
    setFromAccountId(accounts[0]?.id || '');
    setToAccountId(accounts[1]?.id || accounts[0]?.id || '');
    setError(null);
    setModalOpen(true);
  };

  // Adjust category select when type changes in form
  const handleTypeChange = (newType: string) => {
    setType(newType);
    const matchingCats = categories.filter((c) => c.type === newType);
    setCategoryId(matchingCats[0]?.id || '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Amount must be a valid positive number');
      setLoading(false);
      return;
    }

    const payload = {
      amount: numAmount,
      type,
      description: description.trim() || undefined,
      date: new Date(date),
      accountId: type !== 'TRANSFER' ? accountId : null,
      categoryId: type !== 'TRANSFER' ? categoryId : null,
      fromAccountId: type === 'TRANSFER' ? fromAccountId : null,
      toAccountId: type === 'TRANSFER' ? toAccountId : null,
    };

    try {
      await createTransaction(payload);
      setModalOpen(false);
      refreshPage();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (
      !confirm('Are you sure you want to delete this record? Account balances will be reverted.')
    ) {
      return;
    }

    try {
      await deleteTransaction(id);
      refreshPage();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Could not delete transaction');
    }
  };

  // ── Apply filters to transactions list ──
  const filteredTransactions = transactions.filter((tx) => {
    // 1. Account Filter
    if (filterAccount !== 'ALL') {
      if (tx.type === 'TRANSFER') {
        if (tx.fromAccountId !== filterAccount && tx.toAccountId !== filterAccount) return false;
      } else {
        if (tx.accountId !== filterAccount) return false;
      }
    }

    // 2. Type Filter
    if (filterType !== 'ALL' && tx.type !== filterType) {
      return false;
    }

    // 3. Search Query Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const descMatch = tx.description?.toLowerCase().includes(q);
      const catMatch = tx.category?.name.toLowerCase().includes(q);
      if (!descMatch && !catMatch) return false;
    }

    return true;
  });

  const getFilteredTotal = () => {
    return filteredTransactions.reduce((acc, tx) => {
      if (tx.type === 'INCOME') return acc + tx.amount;
      if (tx.type === 'EXPENSE') return acc - tx.amount;
      return acc; // Transfers do not affect overall sum
    }, 0);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-slate-100 to-slate-400 bg-clip-text text-transparent">
            Transactions Registry
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Log financial operations, income, expenses, or transfers
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="px-5 py-3 rounded-xl bg-gradient-to-r from-sky-400 to-indigo-500 hover:from-sky-500 hover:to-indigo-600 text-white font-semibold text-sm shadow-lg shadow-sky-500/20 transition-all cursor-pointer hover:scale-[1.01] active:scale-[0.99] self-start sm:self-auto"
        >
          + Add New Record
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 backdrop-blur-sm">
        <div className="flex flex-wrap items-center gap-3">
          {/* Account Filter */}
          <div className="flex flex-col">
            <span className="text-3xs text-slate-500 uppercase font-bold mb-1">Account</span>
            <select
              value={filterAccount}
              onChange={(e) => setFilterAccount(e.target.value)}
              className="px-3.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-sky-500"
            >
              <option value="ALL">All Accounts</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>

          {/* Type Filter */}
          <div className="flex flex-col">
            <span className="text-3xs text-slate-500 uppercase font-bold mb-1">Type</span>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-sky-500"
            >
              <option value="ALL">All Types</option>
              <option value="INCOME">Income (💰)</option>
              <option value="EXPENSE">Expense (📉)</option>
              <option value="TRANSFER">Transfer (⇄)</option>
            </select>
          </div>
        </div>

        {/* Search Input */}
        <div className="flex flex-col md:w-72">
          <span className="text-3xs text-slate-500 uppercase font-bold mb-1">
            Search description
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Type search terms..."
            className="px-3.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-sky-500 placeholder-slate-600"
          />
        </div>
      </div>

      {/* Stats Summary from Filtered */}
      <div className="bg-slate-950/40 border border-slate-900/60 rounded-2xl p-4 flex items-center justify-between">
        <span className="text-xs text-slate-400 font-medium">Filtered Total Flow:</span>
        <span
          className={`font-mono font-bold text-sm sm:text-base ${
            getFilteredTotal() >= 0 ? 'text-emerald-400' : 'text-rose-400'
          }`}
        >
          {getFilteredTotal() >= 0 ? '+' : ''}
          {getFilteredTotal().toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}{' '}
          THB
        </span>
      </div>

      {/* Transactions Registry List */}
      <div className="bg-slate-900/40 border border-slate-900 rounded-3xl p-6 shadow-lg backdrop-blur-sm">
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-16">
            <span className="text-3xl block mb-2">🔍</span>
            <p className="text-slate-400 text-sm">No transactions match your filters</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-950">
            {filteredTransactions.map((tx) => {
              const isIncome = tx.type === 'INCOME';
              const isExpense = tx.type === 'EXPENSE';
              const isTransfer = tx.type === 'TRANSFER';

              return (
                <div key={tx.id} className="py-4 flex items-center justify-between gap-4">
                  {/* Left: Info details */}
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
                        {new Date(tx.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                        {tx.category && ` • ${tx.category.name}`}
                      </span>
                    </div>
                  </div>

                  {/* Right: Balance adjustment & Delete action */}
                  <div className="flex items-center gap-4">
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
                        {tx.amount.toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}{' '}
                        THB
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

                    <button
                      onClick={() => handleDelete(tx.id)}
                      className="p-2 hover:bg-red-950/20 text-slate-600 hover:text-red-400 rounded-lg transition-all text-xs cursor-pointer"
                      title="Delete Record"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal for transaction creation */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900/95 border border-slate-800 rounded-3xl p-6 shadow-2xl animate-fadeIn relative">
            <h2 className="text-xl font-bold text-slate-100 mb-6">Create New Record</h2>

            {/* Type selector tabs */}
            <div className="flex gap-1.5 p-1 bg-slate-950 border border-slate-850 rounded-xl mb-6">
              {['EXPENSE', 'INCOME', 'TRANSFER'].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => handleTypeChange(t)}
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    type === t
                      ? 'bg-sky-400 text-bg-primary text-black font-bold'
                      : 'text-slate-400'
                  }`}
                >
                  {t === 'EXPENSE' && 'Expense 📉'}
                  {t === 'INCOME' && 'Income 💰'}
                  {t === 'TRANSFER' && 'Transfer ⇄'}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-center">
                  {error}
                </div>
              )}

              {/* Amount input */}
              <div>
                <label className="block text-slate-300 text-xs font-medium mb-1.5">Amount</label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-4 pr-12 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 text-sm font-mono transition-all"
                  />
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                    <span className="text-slate-500 text-xs font-semibold">THB</span>
                  </div>
                </div>
              </div>

              {/* Conditional account selections based on type */}
              {type !== 'TRANSFER' ? (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-300 text-xs font-medium mb-1.5">
                      Account
                    </label>
                    <select
                      value={accountId}
                      onChange={(e) => setAccountId(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-100 focus:outline-none focus:border-sky-500 text-sm"
                    >
                      {accounts.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-300 text-xs font-medium mb-1.5">
                      Category
                    </label>
                    <select
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-100 focus:outline-none focus:border-sky-500 text-sm"
                    >
                      {categories
                        .filter((c) => c.type === type)
                        .map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.icon} {c.name}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-300 text-xs font-medium mb-1.5">From</label>
                    <select
                      value={fromAccountId}
                      onChange={(e) => setFromAccountId(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-100 focus:outline-none focus:border-sky-500 text-sm"
                    >
                      {accounts.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-300 text-xs font-medium mb-1.5">To</label>
                    <select
                      value={toAccountId}
                      onChange={(e) => setToAccountId(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-100 focus:outline-none focus:border-sky-500 text-sm"
                    >
                      {accounts.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Description */}
              <div>
                <label className="block text-slate-300 text-xs font-medium mb-1.5">
                  Description
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g., Dinner with family, Uber ride"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 text-sm transition-all"
                />
              </div>

              {/* Date */}
              <div>
                <label className="block text-slate-300 text-xs font-medium mb-1.5">Date</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-100 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 text-sm font-sans"
                />
              </div>

              {/* Modal footer controls */}
              <div className="flex gap-3 mt-8 pt-4 border-t border-slate-800/60">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-800 bg-slate-950 hover:bg-slate-900 text-sm font-semibold text-slate-400 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-sky-400 to-indigo-500 hover:from-sky-500 hover:to-indigo-600 text-white text-sm font-semibold shadow-lg shadow-sky-500/20 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    'Add Transaction'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
