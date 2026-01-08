# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Repair order form ("Reparatur-Formular") for kletterschuhe.de climbing shoe repair service. German-language application with 3-step wizard form, printable A4 order sheets, and admin area.

## Commands

```bash
# Development
npm run dev          # Start dev server (uses Turbopack)
npm run build        # Production build
npm run lint         # ESLint

# Database
npx prisma generate  # Generate Prisma client (outputs to app/generated/prisma)
npx prisma db push   # Push schema changes to Neon PostgreSQL
npx prisma studio    # Database GUI

# Admin seeding
npx tsx scripts/seed-admin.ts  # Create admin user (admin@kletterschuhe.de / admin123)
```

## Architecture

### Tech Stack
- **Next.js 16** with App Router and Turbopack
- **Prisma 7** with PrismaPg adapter (driver adapter pattern required)
- **Neon PostgreSQL** (serverless)
- **NextAuth v4** with JWT sessions and credentials provider
- **React Hook Form + Zod** for form validation
- **Tailwind CSS 4** with custom kletterschuhe.de design tokens

### Prisma 7 Configuration (Critical)

Prisma 7 requires the driver adapter pattern. The client is generated to `app/generated/prisma/`:

```typescript
// lib/prisma.ts - Required pattern for Prisma 7
import { PrismaClient } from '@/app/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.NEON_DATABASE_URL })
export const prisma = new PrismaClient({ adapter })
```

### Route Structure

```
/                           → Redirects to /order/new
/order/new                  → 3-step wizard (public)
/order/[id]/print           → A4 print view (public)
/order/[id]/confirmation    → Order confirmation

/admin                      → Protected by middleware
/admin/login                → NextAuth credentials login
/admin/orders               → Order list with stats
/admin/orders/[id]          → Order details

/api/auth/[...nextauth]     → NextAuth API routes
```

### Key Modules

- **`lib/pricing.ts`**: Sole prices (32€ standard, 41€ originals), additional services (edge rubber +19€, closure +20€)
- **`lib/validation.ts`**: Zod schemas for customer data and order items
- **`app/order/new/actions.ts`**: Server Actions for order creation
- **`middleware.ts`**: Protects `/admin/*` routes via NextAuth

### Form Flow

1. **CustomerStep**: Billing address, optional delivery address, GDPR/AGB consent
2. **ShoesStep**: Dynamic list of shoes with manufacturer, model, sole type, options
3. **SummaryStep**: Review with KVA (cost estimate) calculation

### Design Tokens

```
Primary Orange: #ef6a27 (gradient from #efa335)
Secondary Teal: #3ca1ac
Dark Text: #38362d
Light Background: #f3f3f3
```

## Environment Variables

Required in `.env.local`:
```
NEON_DATABASE_URL or DATABASE_URL  # PostgreSQL connection string
NEXTAUTH_SECRET                     # JWT signing secret
NEXTAUTH_URL                        # e.g., http://localhost:3000
```

## Deployment

Deployed on Vercel. Environment variables must be set in Vercel dashboard. After deployment, run seed script locally with production DATABASE_URL to create admin user.
