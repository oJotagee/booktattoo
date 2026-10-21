import { beforeEach, describe, expect, it, mock } from 'bun:test';

import { createAxiosError, createApiMock } from '../../../support/mocks';

const api = createApiMock();

mock.module('@/lib/api', () => ({ api }));
mock.module('axios', () => ({
  isAxiosError: (error: unknown) => Boolean((error as { isAxiosError?: boolean })?.isAxiosError),
}));

const { getClientConversation } = await import(
  '@/app/(public)/_data-access/get-client-conversation'
);

const TOKEN = 'cmVxLTE.c2lnbmF0dXJl';

const conversation = {
  id: 'request-1',
  status: 'OPEN' as const,
  clientName: 'Mariana Costa',
  artistId: 'user-1',
  artistName: 'Ana Lima',
  closedAt: null,
  createdAt: '2026-10-20T14:00:00.000Z',
  messages: [],
  offer: null,
};

describe('getClientConversation', () => {
  beforeEach(() => {
    api.get.mockClear();
    api.get.mockImplementation(async () => ({ data: conversation }));
  });

  it('sends the token in the header, never in the URL', async () => {
    const result = await getClientConversation(TOKEN);

    expect(api.get).toHaveBeenCalledWith('/public/booking-requests/conversation', {
      headers: { 'X-Booking-Token': TOKEN },
    });
    expect(result).toEqual(conversation);
  });

  it('returns null for a malformed token without calling the API', async () => {
    const result = await getClientConversation('../../etc');

    expect(result).toBeNull();
    expect(api.get).not.toHaveBeenCalled();
  });

  it('returns null when the API does not find the conversation', async () => {
    api.get.mockImplementationOnce(async () => {
      throw createAxiosError(404);
    });

    expect(await getClientConversation(TOKEN)).toBeNull();
  });

  it('rethrows other errors', async () => {
    api.get.mockImplementationOnce(async () => {
      throw new Error('Network Error');
    });

    await expect(getClientConversation(TOKEN)).rejects.toThrow('Network Error');
  });
});
