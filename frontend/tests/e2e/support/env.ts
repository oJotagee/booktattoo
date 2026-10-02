import path from 'node:path';

export const E2E_ENV = {
  baseUrl: process.env.E2E_BASE_URL ?? 'http://localhost:3000',
  apiUrl: process.env.E2E_API_URL ?? process.env.API_URL ?? 'http://localhost:8000',
  catalogDatabaseUrl:
    process.env.E2E_CATALOG_DATABASE_URL ?? 'postgresql://admin:admin@localhost:5432/catalog',
  user: {
    name: process.env.E2E_USER_NAME ?? 'Artista E2E',
    email: process.env.E2E_USER_EMAIL ?? 'e2e@bookink.dev',
    password: process.env.E2E_USER_PASSWORD ?? 'E2e@Bookink123',
  },
};

export const STORAGE_STATE = path.join(__dirname, '..', '.auth', 'user.json');

export const FLASH_IMAGE = path.join(__dirname, '..', 'fixtures', 'flash.jpg');
export const FLASH_IMAGE_ALT = path.join(__dirname, '..', 'fixtures', 'flash-alt.jpg');
