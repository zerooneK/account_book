'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { useTheme } from '@/components/ThemeProvider';

export function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { theme, toggleTheme } = useTheme();

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

  if (session?.user?.role === 'ADMIN') {
    navItems.push({ href: '/admin', label: 'Admin' });
  }

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-900 px-4 md:px-8 py-4 transition-all duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 hover:opacity-90 transition-opacity">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-400 to-indigo-500 shadow-md shadow-sky-500/20">
            <span className="text-white text-base font-bold font-mono">฿</span>
          </div>
          <span className="text-lg font-bold bg-gradient-to-r from-slate-800 to-slate-950 dark:from-sky-400 dark:to-indigo-400 bg-clip-text text-transparent">
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
                    ? 'bg-slate-100 text-slate-950 border border-slate-200/80 dark:bg-slate-900 dark:text-sky-400 dark:border-slate-800'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/40 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-900/40'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>

        {/* User Info & Actions */}
        <div className="flex items-center gap-4">
          {/* Theme Toggle Button with Gooey Effect */}
          <div className="relative group w-9 h-9 flex items-center justify-center">
            {/* Gooey SVG Filter Container */}
            <svg xmlns="http://www.w3.org/2000/svg" version="1.1" className="hidden">
              <defs>
                <filter id="gooey-theme">
                  <feGaussianBlur in="SourceGraphic" stdDeviation="3.5" result="blur" />
                  <feColorMatrix
                    in="blur"
                    mode="matrix"
                    values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9"
                    result="goo"
                  />
                  <feBlend in="SourceGraphic" in2="goo" />
                </filter>
              </defs>
            </svg>

            {/* Gooey Background Circles */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{ filter: 'url(#gooey-theme)' }}
            >
              {/* Satellite 1 */}
              <div className="absolute w-3.5 h-3.5 rounded-full bg-amber-400 dark:bg-indigo-500 transition-all duration-500 ease-out left-1/2 top-1/2 -ml-1.75 -mt-1.75 group-hover:translate-x-5 group-hover:-translate-y-4 group-hover:scale-110" />
              {/* Satellite 2 */}
              <div className="absolute w-2.5 h-2.5 rounded-full bg-amber-400 dark:bg-indigo-500 transition-all duration-500 ease-out left-1/2 top-1/2 -ml-1.25 -mt-1.25 group-hover:-translate-x-5 group-hover:translate-y-4 group-hover:scale-110" />
              {/* Main background circle */}
              <div className="absolute w-9 h-9 rounded-full bg-amber-400 dark:bg-indigo-500 left-1/2 top-1/2 -ml-4.5 -mt-4.5 transition-all duration-300 group-active:scale-90" />
            </div>

            {/* Sharp Icon Button */}
            <button
              onClick={toggleTheme}
              className="relative z-10 w-9 h-9 flex items-center justify-center text-slate-900 dark:text-slate-100 cursor-pointer focus:outline-none"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? (
                <span className="text-base select-none transform transition-transform duration-500 rotate-0 group-hover:rotate-12">
                  🌙
                </span>
              ) : (
                <span className="text-base select-none transform transition-transform duration-500 rotate-0 group-hover:rotate-45">
                  ☀️
                </span>
              )}
            </button>
          </div>

          {session?.user && (
            <div className="flex items-center gap-3">
              <span className="hidden sm:inline text-xs font-medium text-slate-500 dark:text-slate-400">
                Hi, {session.user.name || session.user.email}
              </span>
              <button
                onClick={() => signOut({ callbackUrl: '/auth/signin' })}
                className="px-3.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-900 dark:text-slate-400 dark:hover:text-slate-200 text-xs font-semibold transition-all cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Navigation Links */}
      <div className="flex md:hidden items-center justify-around gap-1 mt-4 pt-3 border-t border-slate-200 dark:border-slate-900/60">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex-1 text-center py-1.5 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? 'text-slate-950 bg-slate-100 font-bold dark:text-sky-400 dark:bg-slate-900/80'
                  : 'text-slate-500 dark:text-slate-400'
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
