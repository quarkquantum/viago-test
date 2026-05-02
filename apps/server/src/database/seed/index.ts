import { prisma } from '@repo/database';
import { logger } from '@repo/logger';
import { seedDevelopment } from './development';

async function main() {
  const args = process.argv.slice(2);
  const environment = args.find((arg) => arg.startsWith('--environment='))?.split('=')[1] || 'development';

  logger.info(`🚀 Running seed for environment: ${environment}\n`);

  try {
    switch (environment) {
      case 'development': {
        await seedDevelopment();
        break;
      }
      case 'production': {
        logger.warn('⚠️  Production seeding not implemented yet');
        break;
      }
      default: {
        logger.error(`❌ Unknown environment: ${environment}`);
        process.exit(1);
      }
    }
  } catch (error) {
    logger.error('❌ Seeding failed:');
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
