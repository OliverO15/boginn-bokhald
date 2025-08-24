# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 15 application using TypeScript, Tailwind CSS, and Prisma ORM with PostgreSQL. The project name "boginn-bokhald" suggests it's an accounting/bookkeeping application in Icelandic.

## Development Commands

### Primary Development
- `npm run dev` - Start development server with Turbopack (runs on http://localhost:3000)
- `npm run build` - Build the application for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint for code quality checks
- `npm test` - Run unit tests
- `npm run test:watch` - Run tests in watch mode

### Database Operations
- `npx prisma db push` - Push schema changes to database
- `npx prisma generate` - Generate Prisma client after schema changes
- `npx prisma studio` - Open Prisma Studio for database browsing
- `npx prisma migrate dev` - Create and apply new migration
- `npx prisma db seed` - Run database seed scripts (if configured)

## Architecture & Structure

### Technology Stack
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript with strict mode enabled
- **Styling**: Tailwind CSS v4
- **Database**: PostgreSQL with Prisma ORM
- **Fonts**: Geist Sans and Geist Mono from Google Fonts

### Key Configuration
- **Database**: Uses PostgreSQL with connection pooling via Prisma Accelerate extension
- **TypeScript**: Configured with path aliases (`@/*` maps to `./src/*`)
- **Prisma**: Global instance pattern for development with connection reuse
- **Environment**: Requires `DATABASE_URL` and `DIRECT_URL` environment variables

### Project Structure
- `src/app/` - Next.js App Router pages and layouts
- `src/lib/` - Shared utilities and configurations
- `prisma/` - Database schema and migrations
- `public/` - Static assets

### Database Setup
The application uses Prisma with PostgreSQL. The Prisma client is configured with a global instance pattern in `src/lib/prisma.ts` to prevent connection issues in development. Environment variables `DATABASE_URL` and `DIRECT_URL` must be configured for database connectivity.

### Import Patterns
- Use `@/` prefix for imports from the src directory
- Prisma client should be imported from `@/lib/prisma`
- Follow Next.js conventions for page and layout components
- Test the pages you are creating by going into them first and checking if they open without error.