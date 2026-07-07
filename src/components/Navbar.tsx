'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';

export function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  // Do not display navbar if user is on auth pages
  if (pathname?.startsWith('/auth')) {
    return null;
  }

  const navItems = [
    { href: '/', label: 'Dashboard' },
    { href: '/transactions', label: 'Transactions' },
    { href: '/accounts', label: 'Accounts' },
    { href: '/categories', label: 'Categories' },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full bg-slate-950/80 backdrop-blur-md border-b border-slate-900 px-4 md:px-8 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 hover:opacity-90 transition-opacity">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-400 to-indigo-500 shadow-md shadow-sky-500/20">
            <span className="text-white text-base font-bold font-mono">฿</span>
          </div>
          <span className="text-lg font-bold bg-gradient-to-r from-sky-400 to-indigo-400 bg-clip-text text-transparent">
            Account Book
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-1.5">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-slate-900 text-sky-400 border border-slate-800'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>

        {/* User Info & Actions */}
        <div className="flex items-center gap-4">
          {session?.user && (
            <div className="flex items-center gap-3">
              <span className="hidden sm:inline text-xs font-medium text-slate-400">
                Hi, {session.user.name || session.user.email}
              </span>
              <button
                onClick={() => signOut({ callbackUrl: '/auth/signin' })}
                className="px-3.5 py-1.5 rounded-lg border border-slate-800 bg-slate-950 hover:bg-slate-900 hover:text-slate-200 text-xs font-semibold text-slate-400 transition-all cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Navigation Links */}
      <div className="flex md:hidden items-center justify-around gap-1 mt-4 pt-3 border-t border-slate-900/60">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex-1 text-center py-1.5 rounded-lg text-xs font-medium transition-all ${
                isActive ? 'text-sky-400 bg-slate-900/80 font-bold' : 'text-slate-400'
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
