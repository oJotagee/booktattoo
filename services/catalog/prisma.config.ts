import { config } from 'dotenv';

import { defineConfig } from 'prisma/config';

config({
  path: process.cwd().endsWith('/services/catalog') ? '.env' : 'services/catalog/.env',
});

const isProduction = process.env['PRISMA_TARGET'] === 'production';

if (isProduction && !process.env['DATABASE_PROD_URL']) {
  throw new Error('DATABASE_PROD_URL não configurada em services/catalog/.env');
}

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'prisma/seed.ts',
  },
  datasource: {
    url: isProduction ? process.env['DATABASE_PROD_URL'] : process.env['DATABASE_URL'],
  },
});
