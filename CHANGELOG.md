# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.0] - 2026-07-07

### Added

- Implemented Role-Based Access Control (RBAC) with roles `'USER'` and `'ADMIN'`. Added `role` column to `users` table.
- Extended NextAuth.js typing and configurations to return and enforce user role parameters.
- Updated seed script `seed.ts` to insert a default Admin user (`admin@accountbook.com` / `admin123456`) and enforce roles.
- Created Admin Server Actions (`getUsers`, `createAdminUser`, `deleteUser`) protecting endpoints using Admin session checks.
- Integrated the Admin Panel page (`/admin`) presenting a table of all registered users and allowing creation and deletion of user records.
- Added a conditional menu link on the global Navbar showing "Admin" options for users with the `'ADMIN'` role.
- Updated the main `README.md` and walkthrough logs detailing admin access and features.
- Created integration tests verifying database roles and Admin actions.

## [1.1.0] - 2026-07-07

### Added

- Developed `updateTransaction` Server Action executing safe updates of transaction parameters.
- Implemented double balance-synchronization transaction logic: automatically reverting old transaction balance impacts before applying new ones (including changes to amount, account, or type).
- Integrated transaction edit modal and "Edit" button (`✏️`) into the Transactions Registry UI (`/transactions`).
- Added comprehensive integration test case verifying transaction edit balance synchronization logic.

## [1.0.3] - 2026-07-07

### Fixed

- Improved visual contrast and feedback for custom category delete buttons on hover. Switched to transparent borders (to prevent layout shift) that turn red, brighter red icon colors, and 15% opacity bright red background.
- Removed unused imports `eq` and `and` from `seed.ts` to maintain a zero-warning linter output.

## [1.0.2] - 2026-07-07

### Fixed

- Updated system default category icons to emojis (e.g., K-Bank, Cash, Food) to match custom category aesthetics and prevent showing Lucide icon name strings.
- Modified seed script `seed.ts` to replace previous system category records on update.

## [1.0.1] - 2026-07-07

### Added

- Created comprehensive `README.md` containing features summary, tech stack details, folder structure map, local environment setup guidelines, quality control checks, and links to visual system architecture diagrams.

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
