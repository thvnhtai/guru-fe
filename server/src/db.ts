import { PrismaClient } from '@prisma/client'

/**
 * Shared Prisma client instance
 * Prevents multiple instances in serverless/development environments
 */
let prisma: PrismaClient

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient()
} else {
  // Use global to cache the prisma instance in development
  const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClient()
  }
  prisma = globalForPrisma.prisma
}

export { prisma }
