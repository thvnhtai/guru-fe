import { PrismaClient } from '@prisma/client';
/**
 * Shared Prisma client instance
 * Prevents multiple instances in serverless/development environments
 */
declare let prisma: PrismaClient;
export { prisma };
//# sourceMappingURL=db.d.ts.map