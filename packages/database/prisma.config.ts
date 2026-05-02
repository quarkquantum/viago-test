import path from 'node:path';
import { defineConfig } from 'prisma/config';

const datasourceUrl = process.env.POSTGRES_URL ?? process.env.DATABASE_URL;

export default defineConfig({
  datasource: {
    url: datasourceUrl,
  },
  schema: path.join('./prisma', 'schema.prisma'),
  migrations: {
    path: path.join('./prisma', 'migrations'),
  },
});
