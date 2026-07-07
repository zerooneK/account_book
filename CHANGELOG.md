# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
