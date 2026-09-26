import { mock } from 'bun:test';

export function createUserServiceApiMock() {
  return {
    post: mock(async (..._args: unknown[]) => ({ data: undefined as unknown })),
    put: mock(async (..._args: unknown[]) => ({ data: undefined as unknown })),
    patch: mock(async (..._args: unknown[]) => ({ data: undefined as unknown })),
    get: mock(async (..._args: unknown[]) => ({ data: undefined as unknown })),
  };
}

export function createAxiosError(status: number, data?: unknown) {
  return {
    isAxiosError: true,
    response: { status, data },
  };
}

export const createCatalogServiceApiMock = createUserServiceApiMock;
