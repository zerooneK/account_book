'use client';

import React, { useState } from 'react';
import { createAdminUser, deleteUser } from '@/app/actions/admin';

type UserData = {
  id: string;
  email: string;
  name: string | null;
  role: string;
  createdAt: Date | null;
};

export function AdminClient({
  initialUsers,
  currentUserId,
}: {
  initialUsers: UserData[];
  currentUserId: string;
}) {
  const [usersList] = useState<UserData[]>(initialUsers);
  const [modalOpen, setModalOpen] = useState(false);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('USER');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshPage = () => {
    window.location.reload();
  };

  const handleOpenCreate = () => {
    setEmail('');
    setPassword('');
    setName('');
    setRole('USER');
    setError(null);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!email.trim() || !password.trim()) {
      setError('Email and password are required');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      await createAdminUser({
        email,
        password,
        name: name.trim() || undefined,
        role,
      });
      setModalOpen(false);
      refreshPage();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, userEmail: string) => {
    if (id === currentUserId) {
      alert('You cannot delete your own admin account.');
      return;
    }

    if (
      !confirm(
        `Are you sure you want to delete user "${userEmail}"? All of their accounts, categories, and transactions will be deleted permanently.`,
      )
    ) {
      return;
    }

    try {
      await deleteUser(id);
      refreshPage();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Could not delete user');
    }
  };

  const formatDate = (dateVal: Date | string | null) => {
    if (!dateVal) return 'N/A';
    const d = new Date(dateVal);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 w-full space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-slate-800 to-slate-950 dark:from-slate-100 dark:to-slate-400 bg-clip-text text-transparent">
            System Administration
          </h1>
          <p className="text-slate-505 dark:text-slate-400 text-sm mt-1">
            Manage database users, roles, and accounts
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="px-5 py-3 rounded-xl bg-gradient-to-r from-sky-400 to-indigo-500 hover:from-sky-500 hover:to-indigo-600 text-white font-semibold text-sm shadow-lg shadow-sky-500/20 transition-all cursor-pointer hover:scale-[1.01] active:scale-[0.99] self-start sm:self-auto"
        >
          + Create New User
        </button>
      </div>

      {/* Users List Card/Table */}
      <div className="bg-white/80 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-900 rounded-3xl p-6 shadow-lg backdrop-blur-sm overflow-hidden">
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-6 pb-3 border-b border-slate-100 dark:border-slate-950 flex items-center gap-2">
          <span>👥</span> Registered Users ({usersList.length})
        </h2>

        {/* Responsive Table */}
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-950 text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
                <th className="pb-4 pr-4">User Info</th>
                <th className="pb-4 px-4">Role</th>
                <th className="pb-4 px-4">Joined Date</th>
                <th className="pb-4 pl-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-950/60">
              {usersList.map((user) => {
                const isSelf = user.id === currentUserId;
                const isAdmin = user.role === 'ADMIN';

                return (
                  <tr
                    key={user.id}
                    className="text-slate-700 dark:text-slate-200 text-sm hover:bg-slate-50 dark:hover:bg-slate-950/20 transition-all"
                  >
                    {/* User Info */}
                    <td className="py-4 pr-4 flex items-center gap-3">
                      <div className="h-9 w-9 rounded-xl bg-slate-100 dark:bg-slate-950/65 flex items-center justify-center font-bold text-slate-550 dark:text-slate-400 border border-slate-200 dark:border-slate-850">
                        {user.name ? user.name.substring(0, 2).toUpperCase() : 'U'}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 dark:text-slate-100 leading-tight">
                          {user.name || 'Anonymous User'}
                        </p>
                        <p className="text-slate-500 dark:text-slate-500 text-xs mt-0.5">
                          {user.email}
                        </p>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="py-4 px-4">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-3xs font-extrabold tracking-wider uppercase border ${
                          isAdmin
                            ? 'bg-indigo-950/30 border-indigo-500/40 text-indigo-400'
                            : 'bg-slate-100 border-slate-200 text-slate-600 dark:bg-slate-950/40 dark:border-slate-800 dark:text-slate-400'
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>

                    {/* Joined Date */}
                    <td className="py-4 px-4 font-mono text-slate-500 dark:text-slate-400 text-xs">
                      {formatDate(user.createdAt)}
                    </td>

                    {/* Actions */}
                    <td className="py-4 pl-4 text-right">
                      {isSelf ? (
                        <span className="text-xs text-slate-555 dark:text-slate-500 italic font-medium pr-3.5">
                          Logged In (Self)
                        </span>
                      ) : (
                        <button
                          onClick={() => handleDelete(user.id, user.email)}
                          className="p-2 border border-transparent hover:border-red-500/30 hover:bg-red-500/15 text-slate-500 hover:text-red-655 dark:text-slate-400 dark:hover:text-red-400 rounded-xl transition-all text-xs cursor-pointer inline-block"
                          title="Delete User"
                        >
                          🗑️ Delete
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for User Creation */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white/95 border border-slate-200 dark:bg-slate-900/95 dark:border-slate-800 rounded-3xl p-6 shadow-2xl animate-fadeIn relative">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-6">
              Create New User Account
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-center">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-slate-705 dark:text-slate-300 text-xs font-medium mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., John Doe"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-505 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 text-sm transition-all dark:bg-slate-950/80 dark:border-slate-800 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-705 dark:text-slate-300 text-xs font-medium mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-550 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 text-sm transition-all dark:bg-slate-950/80 dark:border-slate-800 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-705 dark:text-slate-300 text-xs font-medium mb-1.5 font-sans">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-550 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 text-sm transition-all dark:bg-slate-950/80 dark:border-slate-800 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-705 dark:text-slate-300 text-xs font-medium mb-1.5">
                  User Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 text-sm transition-all dark:bg-slate-950/80 dark:border-slate-800 dark:text-slate-100"
                >
                  <option value="USER">Regular User (USER)</option>
                  <option value="ADMIN">Administrator (ADMIN)</option>
                </select>
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
                  ) : (
                    'Create User'
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
