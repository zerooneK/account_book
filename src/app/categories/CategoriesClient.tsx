'use client';

import React, { useState } from 'react';
import { createCategory, deleteCategory } from '@/app/actions/categories';

type Category = {
  id: string;
  name: string;
  type: string;
  color: string | null;
  icon: string | null;
  userId: string | null;
  createdAt: Date | null;
};

// Preset colors for visual consistency
const PRESET_COLORS = [
  '#ef4444', // Red
  '#f59e0b', // Amber
  '#10b981', // Emerald
  '#06b6d4', // Cyan
  '#3b82f6', // Blue
  '#8b5cf6', // Purple
  '#ec4899', // Pink
  '#6b7280', // Gray
  '#f43f5e', // Rose
  '#e11d48', // Crimson
  '#14b8a6', // Teal
  '#a855f7', // Violet
];

// Preset emojis for fast entry
const PRESET_EMOJIS = ['🍔', '🚗', '🛍️', '🎬', '💡', '🏥', '💸', '💼', '📈', '🏠', '🐈', '✈️'];

export function CategoriesClient({ initialCategories }: { initialCategories: Category[] }) {
  const [categories] = useState<Category[]>(initialCategories);
  const [modalOpen, setModalOpen] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [type, setType] = useState('EXPENSE');
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [icon, setIcon] = useState(PRESET_EMOJIS[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshCategories = () => {
    window.location.reload();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!name.trim()) {
      setError('Category name is required');
      setLoading(false);
      return;
    }

    try {
      await createCategory({
        name,
        type,
        color,
        icon,
      });
      setModalOpen(false);
      refreshCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this custom category?')) {
      return;
    }

    try {
      await deleteCategory(id);
      refreshCategories();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Could not delete category');
    }
  };

  const incomeCategories = categories.filter((c) => c.type === 'INCOME');
  const expenseCategories = categories.filter((c) => c.type === 'EXPENSE');

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 w-full space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-slate-100 to-slate-400 bg-clip-text text-transparent">
            Categories Configuration
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Configure transaction tags, colors, and icons
          </p>
        </div>
        <button
          onClick={() => {
            setName('');
            setType('EXPENSE');
            setColor(PRESET_COLORS[0]);
            setIcon(PRESET_EMOJIS[0]);
            setError(null);
            setModalOpen(true);
          }}
          className="px-5 py-3 rounded-xl bg-gradient-to-r from-sky-400 to-indigo-500 hover:from-sky-500 hover:to-indigo-600 text-white font-semibold text-sm shadow-lg shadow-sky-500/20 transition-all cursor-pointer hover:scale-[1.01] active:scale-[0.99] self-start sm:self-auto"
        >
          + Create Custom Category
        </button>
      </div>

      {/* Main categories view split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Expense Categories */}
        <div className="bg-slate-900/40 border border-slate-900 rounded-3xl p-6 shadow-lg backdrop-blur-sm space-y-6">
          <h2 className="text-lg font-bold text-rose-400 pb-2 border-b border-slate-950 flex items-center gap-2">
            <span>📉</span> Expense Categories
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {expenseCategories.map((cat) => (
              <div
                key={cat.id}
                className="bg-slate-950/40 border border-slate-800/40 hover:border-slate-800 rounded-2xl p-4 flex items-center justify-between transition-all"
              >
                <div className="flex items-center gap-3">
                  <span
                    className="text-xl p-2 rounded-xl flex items-center justify-center border border-slate-800/40 shadow-inner"
                    style={{ backgroundColor: `${cat.color}15`, color: cat.color || '#fff' }}
                  >
                    {cat.icon || '🏷️'}
                  </span>
                  <div>
                    <h3 className="font-bold text-sm text-slate-200">{cat.name}</h3>
                    <span className="text-3xs text-slate-500 uppercase font-bold tracking-wider">
                      {cat.userId ? 'Custom' : 'System Default'}
                    </span>
                  </div>
                </div>

                {cat.userId && (
                  <button
                    onClick={() => handleDelete(cat.id)}
                    className="p-2 hover:bg-red-950/20 text-slate-500 hover:text-red-400 rounded-lg transition-all text-xs cursor-pointer"
                    title="Delete Category"
                  >
                    🗑️
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Income Categories */}
        <div className="bg-slate-900/40 border border-slate-900 rounded-3xl p-6 shadow-lg backdrop-blur-sm space-y-6">
          <h2 className="text-lg font-bold text-emerald-400 pb-2 border-b border-slate-950 flex items-center gap-2">
            <span>💰</span> Income Categories
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {incomeCategories.map((cat) => (
              <div
                key={cat.id}
                className="bg-slate-950/40 border border-slate-800/40 hover:border-slate-800 rounded-2xl p-4 flex items-center justify-between transition-all"
              >
                <div className="flex items-center gap-3">
                  <span
                    className="text-xl p-2 rounded-xl flex items-center justify-center border border-slate-800/40 shadow-inner"
                    style={{ backgroundColor: `${cat.color}15`, color: cat.color || '#fff' }}
                  >
                    {cat.icon || '🏷️'}
                  </span>
                  <div>
                    <h3 className="font-bold text-sm text-slate-200">{cat.name}</h3>
                    <span className="text-3xs text-slate-500 uppercase font-bold tracking-wider">
                      {cat.userId ? 'Custom' : 'System Default'}
                    </span>
                  </div>
                </div>

                {cat.userId && (
                  <button
                    onClick={() => handleDelete(cat.id)}
                    className="p-2 hover:bg-red-950/20 text-slate-500 hover:text-red-400 rounded-lg transition-all text-xs cursor-pointer"
                    title="Delete Category"
                  >
                    🗑️
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal for category creation */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900/95 border border-slate-800 rounded-3xl p-6 shadow-2xl animate-fadeIn relative">
            <h2 className="text-xl font-bold text-slate-100 mb-6">Create Custom Category</h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-center">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-slate-300 text-xs font-medium mb-1.5 font-sans">
                  Category Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Subscriptions, Pet Food"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 text-sm transition-all"
                />
              </div>

              <div>
                <label className="block text-slate-300 text-xs font-medium mb-1.5">
                  Category Type
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-100 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 text-sm transition-all"
                >
                  <option value="EXPENSE">Expense (📉)</option>
                  <option value="INCOME">Income (💰)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 text-xs font-medium mb-2">
                  Select Color
                </label>
                <div className="grid grid-cols-6 gap-2">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`h-9 w-9 rounded-xl transition-all cursor-pointer ${
                        color === c
                          ? 'ring-2 ring-white scale-110 shadow-lg'
                          : 'opacity-80 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-slate-300 text-xs font-medium mb-2">
                  Select Icon / Emoji
                </label>
                <div className="grid grid-cols-6 gap-2 mb-3">
                  {PRESET_EMOJIS.map((e) => (
                    <button
                      key={e}
                      type="button"
                      onClick={() => setIcon(e)}
                      className={`h-9 w-9 rounded-xl bg-slate-950/80 border flex items-center justify-center text-lg transition-all cursor-pointer ${
                        icon === e
                          ? 'border-sky-500 ring-1 ring-sky-500 scale-110 shadow-lg'
                          : 'border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {e}
                    </button>
                  ))}
                </div>

                <div className="flex gap-2 items-center">
                  <span className="text-xs text-slate-500">Or type custom emoji:</span>
                  <input
                    type="text"
                    maxLength={2}
                    value={icon}
                    onChange={(e) => setIcon(e.target.value)}
                    className="w-12 text-center py-1 rounded bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

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
                    'Create Category'
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
