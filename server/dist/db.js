import { PrismaClient } from '@prisma/client';
/**
 * Shared Prisma client instance
 * Prevents multiple instances in serverless/development environments
 */
let prisma;
if (process.env.NODE_ENV === 'production') {
    prisma = new PrismaClient();
}
else {
    // Use global to cache the prisma instance in development
    const globalForPrisma = globalThis;
    if (!globalForPrisma.prisma) {
        globalForPrisma.prisma = new PrismaClient();
    }
    prisma = globalForPrisma.prisma;
}
export { prisma };
//# sourceMappingURL=db.js.map