import { test as base } from '@playwright/test';

import { E2EApi } from './api';

export const test = base.extend<{ api: E2EApi }>({
  api: async ({ playwright }, use) => {
    const api = await E2EApi.connect(playwright.request);
    await use(api);
    await api.dispose();
  },
});

export { expect } from '@playwright/test';
