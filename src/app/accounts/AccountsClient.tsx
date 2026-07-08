'use client';

import React, { useState } from 'react';
import { createAccount, updateAccount, deleteAccount } from '@/app/actions/accounts';

type Account = {
  id: string;
  name: string;
  type: string;
  balance: number;
  userId: string;
  createdAt: Date | null;
};

export function AccountsClient({ initialAccounts }: { initialAccounts: Account[] }) {
  const accounts = initialAccounts;
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [type, setType] = useState('BANK');
  const [balance, setBalance] = useState('0');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Re-fetch accounts local helper (to update local state directly for fast UI)
  const refreshAccounts = async () => {
    // In a real app we could fetch from api or use actions, but here we can just update state
    // since the server action calls revalidatePath. We will reload page or trigger server components.
    window.location.reload();
  };

  const handleOpenCreate = () => {
    setEditingAccount(null);
    setName('');
    setType('BANK');
    setBalance('0');
    setError(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (acc: Account) => {
    setEditingAccount(acc);
    setName(acc.name);
    setType(acc.type);
    setBalance(acc.balance.toString());
    setError(null);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!name.trim()) {
      setError('Account name is required');
      setLoading(false);
      return;
    }

    const numBalance = parseFloat(balance);
    if (isNaN(numBalance)) {
      setError('Please enter a valid balance');
      setLoading(false);
      return;
    }

    try {
      if (editingAccount) {
        // Edit mode
        await updateAccount(editingAccount.id, {
          name,
          type,
          balance: numBalance,
        });
      } else {
        // Create mode
        await createAccount({
          name,
          type,
          balance: numBalance,
        });
      }
      setModalOpen(false);
      refreshAccounts();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (
      !confirm(
        'Are you sure you want to delete this account? All associated transactions will be deleted.',
      )
    ) {
      return;
    }

    try {
      await deleteAccount(id);
      refreshAccounts();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Could not delete account');
    }
  };

  const getAccountIcon = (type: string) => {
    switch (type) {
      case 'CASH':
        return '💰';
      case 'CREDIT_CARD':
        return '💳';
      case 'BANK':
      default:
        return '🏦';
    }
  };

  const getAccountTypeLabel = (type: string) => {
    switch (type) {
      case 'CASH':
        return 'Cash';
      case 'CREDIT_CARD':
        return 'Credit Card';
      case 'BANK':
      default:
        return 'Bank Account';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-slate-800 to-slate-950 dark:from-slate-100 dark:to-slate-400 bg-clip-text text-transparent">
            Accounts Management
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Create and manage your liquid assets and credit lines
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="px-5 py-3 rounded-xl bg-gradient-to-r from-sky-400 to-indigo-500 hover:from-sky-500 hover:to-indigo-600 text-white font-semibold text-sm shadow-lg shadow-sky-500/20 transition-all cursor-pointer hover:scale-[1.01] active:scale-[0.99] self-start sm:self-auto"
        >
          + Add New Account
        </button>
      </div>

      {/* Grid of Accounts */}
      {accounts.length === 0 ? (
        <div className="text-center py-16 bg-white/80 dark:bg-slate-900/20 border border-slate-200/80 dark:border-slate-900 rounded-3xl backdrop-blur-sm">
          <div className="text-4xl mb-4">🏦</div>
          <h3 className="text-slate-900 dark:text-slate-200 font-semibold text-lg">
            No accounts created yet
          </h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 mb-6">
            Create your first account to start tracking transactions
          </p>
          <button
            onClick={handleOpenCreate}
            className="px-4 py-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 text-sm font-semibold transition-all cursor-pointer"
          >
            Create Account
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {accounts.map((acc) => (
            <div
              key={acc.id}
              className="bg-white/80 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-900/80 rounded-2xl p-6 flex flex-col justify-between shadow-lg backdrop-blur-sm hover:border-slate-350 dark:hover:border-slate-800/80 transition-all relative overflow-hidden group"
            >
              {/* Highlight gradient */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-sky-500/5 to-transparent rounded-bl-full pointer-events-none" />

              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl p-2.5 rounded-xl bg-slate-100/80 border border-slate-200/60 dark:bg-slate-950/60 dark:border-slate-800/50">
                      {getAccountIcon(acc.type)}
                    </span>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-slate-100 text-lg leading-tight">
                        {acc.name}
                      </h3>
                      <span className="text-xs text-slate-500 font-medium">
                        {getAccountTypeLabel(acc.type)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <span className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">
                    Current Balance
                  </span>
                  <p className="text-2xl font-black text-slate-900 dark:text-slate-100 font-mono tracking-tight mt-1">
                    {acc.balance.toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}{' '}
                    <span className="text-sky-400 dark:text-sky-400 font-sans text-base font-bold">
                      THB
                    </span>
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2.5 mt-8 border-t border-slate-100 dark:border-slate-950 pt-4">
                <button
                  onClick={() => handleOpenEdit(acc)}
                  className="flex-1 py-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 text-slate-700 dark:bg-slate-950/60 dark:hover:bg-slate-800 dark:border-slate-800/60 dark:hover:border-slate-700 text-xs font-semibold dark:text-slate-300 transition-all cursor-pointer"
                >
                  Edit Account
                </button>
                <button
                  onClick={() => handleDelete(acc.id)}
                  className="py-2 px-3 rounded-lg border border-red-200 hover:border-red-300 bg-red-50 hover:bg-red-100 text-red-650 dark:border-red-950/40 dark:hover:border-red-900/60 dark:bg-red-950/10 dark:hover:bg-red-950/30 text-xs font-semibold dark:text-red-400 dark:hover:text-red-300 transition-all cursor-pointer"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Account Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white/95 border border-slate-200 dark:bg-slate-900/95 dark:border-slate-800 rounded-3xl p-6 shadow-2xl animate-fadeIn relative">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-6">
              {editingAccount ? 'Edit Account' : 'Add New Account'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-center">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-slate-700 dark:text-slate-300 text-xs font-medium mb-1.5">
                  Account Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Cash, K-Bank Savings"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 dark:bg-slate-950/80 dark:border-slate-800 dark:text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 text-sm transition-all"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 text-xs font-medium mb-1.5">
                  Account Type
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 dark:bg-slate-950/80 dark:border-slate-800 dark:text-slate-100 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 text-sm transition-all"
                >
                  <option value="BANK">Bank Account (🏦)</option>
                  <option value="CASH">Cash (💰)</option>
                  <option value="CREDIT_CARD">Credit Card (💳)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 text-xs font-medium mb-1.5">
                  {editingAccount ? 'Adjust Balance' : 'Initial Balance'}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={balance}
                    onChange={(e) => setBalance(e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-4 pr-12 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 dark:bg-slate-950/80 dark:border-slate-800 dark:text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 text-sm font-mono transition-all"
                  />
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                    <span className="text-slate-500 text-xs font-semibold">THB</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-8 pt-4 border-t border-slate-200 dark:border-slate-800/60">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-650 dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-900 text-sm font-semibold dark:text-slate-400 transition-all cursor-pointer"
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
                  ) : editingAccount ? (
                    'Save Changes'
                  ) : (
                    'Create Account'
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
