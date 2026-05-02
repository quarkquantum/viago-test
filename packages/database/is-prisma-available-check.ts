import { Prisma, prisma } from '.';
export async function isPrismaAvailableCheck() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientInitializationError) {
      // Database might not available at build time.
      return false;
    }
    throw error;
  }
}
