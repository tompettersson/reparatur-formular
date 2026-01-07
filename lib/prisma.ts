import { PrismaClient } from '@/app/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient(): PrismaClient {
  // Use NEON_DATABASE_URL (set in .env.local from Vercel)
  // Falls back to DATABASE_URL for compatibility
  const connectionString = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL

  if (!connectionString) {
    throw new Error('Database URL not configured. Set NEON_DATABASE_URL or DATABASE_URL.')
  }

  const adapter = new PrismaPg({
    connectionString,
  })

  return new PrismaClient({
    adapter,
  })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
