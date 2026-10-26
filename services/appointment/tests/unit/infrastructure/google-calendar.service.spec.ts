import { afterEach, beforeEach, describe, expect, it, mock } from 'bun:test';
import { GoogleCalendarService } from '@/infrastructure/google-calendar/google-calendar.service';
import type { PrismaService } from '@/infrastructure/prisma/prisma.service';

describe('GoogleCalendarService OAuth', () => {
  const originalFetch = globalThis.fetch;
  let state: { state: string; userId: string; expiresAt: Date } | null;
  let connection: { userId: string; refreshTokenEncrypted: string; status: string } | null;
  let savedConnection: Record<string, unknown> | null;
  let deleteState: ReturnType<typeof mock>;
  let service: GoogleCalendarService;

  beforeEach(() => {
    process.env.GOOGLE_CALENDAR_CLIENT_ID = 'client-id';
    process.env.GOOGLE_CALENDAR_CLIENT_SECRET = 'client-secret';
    process.env.GOOGLE_CALENDAR_REDIRECT_URI = 'http://localhost:8082/google-calendar/callback';
    process.env.GOOGLE_CALENDAR_ENCRYPTION_KEY = '1'.repeat(64);
    state = null;
    connection = null;
    savedConnection = null;
    deleteState = mock(async () => {
      const hadState = Boolean(state);
      state = null;
      return { count: hadState ? 1 : 0 };
    });
    const prisma = {
      googleCalendarOAuthState: {
        create: mock(async ({ data }) => {
          state = data;
        }),
        findUnique: mock(async () => state),
        deleteMany: deleteState,
      },
      googleCalendarConnection: {
        findUnique: mock(async () => connection),
        upsert: mock(async ({ create, update }) => {
          savedConnection = connection ? update : create;
        }),
      },
    };
    service = new GoogleCalendarService(prisma as unknown as PrismaService);
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('creates a short-lived, user-bound OAuth state with the minimum calendar scope', async () => {
    const authorization = new URL(await service.startAuthorization('artist-1'));
    expect(authorization.searchParams.get('state')).toBe(state?.state ?? null);
    expect(state?.userId).toBe('artist-1');
    expect(state?.expiresAt.getTime()).toBeGreaterThan(Date.now());
    expect(authorization.searchParams.get('scope')).toBe(
      'https://www.googleapis.com/auth/calendar.events',
    );
    expect(authorization.searchParams.get('access_type')).toBe('offline');
  });

  it('rejects an invalid, expired, or replayed state before exchanging the code', async () => {
    state = { state: 'expired', userId: 'artist-1', expiresAt: new Date(Date.now() - 1) };
    globalThis.fetch = mock(async () => {
      throw new Error('must not exchange');
    }) as unknown as typeof fetch;
    await expect(service.completeAuthorization('code', 'expired')).rejects.toThrow(
      'Invalid OAuth state',
    );
    expect(deleteState).not.toHaveBeenCalled();
  });

  it('encrypts the refresh token and preserves the existing value when Google omits one', async () => {
    const encrypted = (service as unknown as { encrypt(value: string): string }).encrypt(
      'old-refresh-token',
    );
    connection = { userId: 'artist-1', refreshTokenEncrypted: encrypted, status: 'CONNECTED' };
    state = {
      state: 'one-time-state',
      userId: 'artist-1',
      expiresAt: new Date(Date.now() + 60_000),
    };
    globalThis.fetch = mock(
      async () => new Response(JSON.stringify({ access_token: 'temporary' }), { status: 200 }),
    ) as unknown as typeof fetch;

    await service.completeAuthorization('authorization-code', 'one-time-state');

    const stored = savedConnection?.refreshTokenEncrypted as string;
    expect(stored).not.toContain('old-refresh-token');
    expect((service as unknown as { decrypt(value: string): string }).decrypt(stored)).toBe(
      'old-refresh-token',
    );
    expect(state).toBeNull();
  });
});
