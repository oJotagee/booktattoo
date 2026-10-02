import { expect, request, test as setup } from '@playwright/test';

import { E2E_ENV, STORAGE_STATE } from './support/env';
import { E2EApi } from './support/api';

setup('verifica se a stack de dev está de pé', async () => {
  const context = await request.newContext({ baseURL: E2E_ENV.apiUrl });

  const checks = [
    { service: 'user', path: '/public/artists', expected: [200] },
    { service: 'catalog', path: '/services', expected: [401] },
  ];

  for (const { service, path, expected } of checks) {
    const response = await context.get(path).catch(() => null);
    const status = response?.status();

    expect(
      status !== undefined && expected.includes(status),
      `GET ${E2E_ENV.apiUrl}${path} respondeu ${status ?? 'sem conexão'}. ` +
        `Confira se o compose dev (Kong) e o serviço "${service}" estão rodando.`,
    ).toBe(true);
  }

  await context.dispose();
});

setup('limpa os dados do usuário E2E', async () => {
  const api = await E2EApi.connect();
  await api.deleteAllData();
  await api.dispose();
});

setup('autentica pela tela de login', async ({ page }) => {
  await page.goto('/login');

  const form = page.locator('form');
  await form.getByLabel('E-mail').fill(E2E_ENV.user.email);
  await form.getByLabel('Senha', { exact: true }).fill(E2E_ENV.user.password);
  await form.getByRole('button', { name: 'Entrar' }).click();

  await page.waitForURL('**/dashboard');
  await page.context().storageState({ path: STORAGE_STATE });
});
