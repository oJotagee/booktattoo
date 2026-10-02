import { test as teardown } from '@playwright/test';

import { E2EApi } from './support/api';

teardown('remove flashes (e imagens no S3) e serviços do usuário E2E', async () => {
  const api = await E2EApi.connect();
  await api.deleteAllData();
  await api.dispose();
});
