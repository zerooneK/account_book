# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-07-07

### Added

- Developed comprehensive Unit and Integration test suites verifying database queries, user authentication, transaction logic, and balance sync operations.
- Successfully set up automated schema deployment and clean-up for test database files in test environment.
- Verified that Husky and lint-staged pre-commit hooks run tests and format checks properly.
- Successfully built optimized production package for Next.js and TailwindCSS v4 with zero TypeScript compilation warnings/errors.

## [0.5.0] - 2026-07-07

### Added

- Developed Server Actions for Category CRUD operations (`createCategory`, `deleteCategory`).
- Developed Server Actions for Transaction logging (`createTransaction`, `deleteTransaction`) wrapped inside database transactions.
- Implemented balance synchronization logic (updating account balances when transactions are created or deleted, including transfers).
- Created Categories Config UI (`/categories`) supporting preset colors/emojis and custom category addition.
- Created Transactions Registry UI (`/transactions`) featuring record creation form, tabular list, and filtering (by account, type, or query).

## [0.4.0] - 2026-07-07

### Added

- Developed Server Actions for Account CRUD operations (`createAccount`, `updateAccount`, `deleteAccount`).
- Created responsive modern glassmorphic global Navbar component with logout action.
- Implemented Accounts Management UI (`/accounts`) to manage cash, bank, and credit accounts.
- Implemented Dashboard page (`/`) calculating net worth assets, monthly inflows/outflows, and category expenses.
- Integrated Tailwind CSS v4 styling in layout and navigation.

## [0.3.0] - 2026-07-07

### Added

- Installed and configured NextAuth.js (Auth.js) with credentials authentication provider.
- Created `src/lib/auth.ts` with custom authorize logic connected to SQLite DB.
- Created registration API endpoint `/api/auth/register` with input validation, password hashing, and user creation.
- Implemented responsive glassmorphism auth pages for Sign In (`/auth/signin`) and Sign Up (`/auth/signup`).
- Created Client Provider wrapper for NextAuth Session and wrapped root layout.
- Added custom TypeScript definition extensions for NextAuth session user IDs.

## [0.2.0] - 2026-07-07

### Added

- Configured Drizzle ORM for SQLite database management.
- Defined schemas for Users, Accounts, Categories, and Transactions tables.
- Created `drizzle.config.ts` for database migration management.
- Created database client configuration inside `src/db/index.ts`.
- Implemented in-memory test database configurations under `src/lib/test-db.ts`.
- Developed database seed script `src/db/seed.ts` with default system categories.
- Generated and executed migrations, initializing `local.db`.

## [0.1.0] - 2026-07-07

### Added

- Initialized Next.js project using App Router, TypeScript, and TailwindCSS v4.
- Setup Prettier for code formatting.
- Configured Husky and lint-staged to run code style checks and test runs on pre-commit.
- Integrated Vitest and React Testing Library for Unit and Integration testing.
- Created System Architecture, ERD, and Sequence Diagrams under `docs/`.
