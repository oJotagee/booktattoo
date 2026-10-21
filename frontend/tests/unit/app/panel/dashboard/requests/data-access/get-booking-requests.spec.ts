import { beforeEach, describe, expect, it, mock } from 'bun:test';

import { createAxiosError, createApiMock } from '../../../../../support/mocks';

const api = createApiMock();
const getAccessToken = mock(async (): Promise<string | null> => 'access-token');

mock.module('@/lib/api', () => ({ api }));
mock.module('@/lib/get-access-token', () => ({ getAccessToken }));
mock.module('axios', () => ({
  isAxiosError: (error: unknown) => Boolean((error as { isAxiosError?: boolean })?.isAxiosError),
}));

const { getBookingRequests } = await import(
  '@/app/(panel)/dashboard/requests/_data-access/get-booking-requests'
);
const { getBookingRequest } = await import(
  '@/app/(panel)/dashboard/requests/_data-access/get-booking-request'
);

describe('getBookingRequests', () => {
  beforeEach(() => {
    api.get.mockClear();
    getAccessToken.mockImplementation(async () => 'access-token');
  });

  it('throws when the user is not authenticated', async () => {
    getAccessToken.mockImplementationOnce(async () => null);

    await expect(getBookingRequests({ status: 'OPEN', limit: 10, offset: 0 })).rejects.toThrow(
      'Usuário não autenticado',
    );
    expect(api.get).not.toHaveBeenCalled();
  });

  it('requests the page filtered by status', async () => {
    const list = [{ id: 'request-1', clientName: 'Mariana Costa', awaitingReply: true }];
    const pagination = { total: 1, page: 2, perPage: 10, totalPages: 2 };
    api.get.mockImplementationOnce(async () => ({ data: { list, pagination } }));

    const result = await getBookingRequests({ status: 'CLOSED', limit: 10, offset: 10 });

    expect(api.get).toHaveBeenCalledWith('/booking-requests', {
      params: { status: 'CLOSED', limit: 10, offset: 10 },
      headers: { Authorization: 'Bearer access-token' },
    });
    expect(result).toEqual({ list, pagination } as unknown as typeof result);
  });
});

describe('getBookingRequest', () => {
  beforeEach(() => {
    api.get.mockClear();
    getAccessToken.mockImplementation(async () => 'access-token');
  });

  it('returns the conversation with its messages', async () => {
    const request = { id: 'request-1', messages: [] };
    api.get.mockImplementationOnce(async () => ({ data: request }));

    const result = await getBookingRequest('request-1');

    expect(api.get).toHaveBeenCalledWith('/booking-requests/request-1', {
      headers: { Authorization: 'Bearer access-token' },
    });
    expect(result).toEqual(request as unknown as typeof result);
  });

  it('returns null when the conversation belongs to another artist', async () => {
    api.get.mockImplementationOnce(async () => {
      throw createAxiosError(403);
    });

    expect(await getBookingRequest('request-1')).toBeNull();
  });

  it('returns null when the conversation does not exist', async () => {
    api.get.mockImplementationOnce(async () => {
      throw createAxiosError(404);
    });

    expect(await getBookingRequest('request-1')).toBeNull();
  });
});
