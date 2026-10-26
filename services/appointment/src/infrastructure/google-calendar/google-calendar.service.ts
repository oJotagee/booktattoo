import { createHash, createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const SCOPE = 'https://www.googleapis.com/auth/calendar.events';
const MAX_ATTEMPTS = 12;

type GoogleTokenResponse = { access_token: string; refresh_token?: string; error?: string };
type CalendarJob = {
  id: string;
  operation: string;
  eventId: string | null;
  attempts: number;
  appointment: {
    id: string;
    userId: string;
    status: string;
    scheduledAt: Date;
    duration: number;
    galeryTitle: string | null;
    clientName: string;
  };
};

@Injectable()
export class GoogleCalendarService implements OnModuleInit {
  private readonly logger = new Logger(GoogleCalendarService.name);
  private running = false;

  constructor(private readonly prisma: PrismaService) {}

  async startAuthorization(userId: string): Promise<string> {
    const state = randomBytes(32).toString('hex');
    await this.prisma.googleCalendarOAuthState.deleteMany({
      where: { expiresAt: { lte: new Date() } },
    });

    await this.prisma.googleCalendarOAuthState.create({
      data: { state, userId, expiresAt: new Date(Date.now() + 10 * 60_000) },
    });

    const url = new URL('https://accounts.google.com/o/oauth2/v2/auth');

    url.search = new URLSearchParams({
      client_id: this.required('GOOGLE_CALENDAR_CLIENT_ID'),
      redirect_uri: this.required('GOOGLE_CALENDAR_REDIRECT_URI'),
      response_type: 'code',
      scope: SCOPE,
      access_type: 'offline',
      prompt: 'consent',
      state,
    }).toString();

    return url.toString();
  }

  async completeAuthorization(code: string, state: string): Promise<void> {
    const stateRecord = await this.prisma.googleCalendarOAuthState.findUnique({ where: { state } });

    if (!stateRecord || stateRecord.expiresAt <= new Date()) throw new Error('Invalid OAuth state');

    const consumed = await this.prisma.googleCalendarOAuthState.deleteMany({
      where: { state, userId: stateRecord.userId, expiresAt: { gt: new Date() } },
    });
    if (consumed.count !== 1) throw new Error('Invalid OAuth state');

    const tokens = await this.tokenRequest({
      code,
      grant_type: 'authorization_code',
      redirect_uri: this.required('GOOGLE_CALENDAR_REDIRECT_URI'),
    });

    const existing = await this.prisma.googleCalendarConnection.findUnique({
      where: { userId: stateRecord.userId },
    });

    const refreshToken =
      tokens.refresh_token ?? (existing ? this.decrypt(existing.refreshTokenEncrypted) : null);

    if (!refreshToken) throw new Error('Google did not return a refresh token');

    await this.prisma.googleCalendarConnection.upsert({
      where: { userId: stateRecord.userId },
      create: { userId: stateRecord.userId, refreshTokenEncrypted: this.encrypt(refreshToken) },
      update: { refreshTokenEncrypted: this.encrypt(refreshToken), status: 'CONNECTED' },
    });
  }

  async status(
    userId: string,
  ): Promise<{ connected: boolean; status: string; pending: number; failed: number }> {
    const [row, pending, failed] = await Promise.all([
      this.prisma.googleCalendarConnection.findUnique({
        where: { userId },
        select: { status: true },
      }),
      this.prisma.calendarSync.count({ where: { appointment: { userId }, status: 'PENDING' } }),
      this.prisma.calendarSync.count({ where: { appointment: { userId }, status: 'FAILED' } }),
    ]);
    return {
      connected: row?.status === 'CONNECTED',
      status: row?.status ?? 'DISCONNECTED',
      pending,
      failed,
    };
  }

  async disconnect(userId: string): Promise<void> {
    const connection = await this.prisma.googleCalendarConnection.findUnique({ where: { userId } });
    if (connection) {
      try {
        await fetch('https://oauth2.googleapis.com/revoke', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({ token: this.decrypt(connection.refreshTokenEncrypted) }),
        });
      } catch {
        // Disconnect locally even if Google's revocation endpoint is unavailable.
      }
    }
    await this.prisma.googleCalendarConnection.deleteMany({ where: { userId } });
  }

  async retryFailed(userId: string): Promise<number> {
    const result = await this.prisma.calendarSync.updateMany({
      where: { status: 'FAILED', appointment: { userId } },
      data: { status: 'PENDING', attempts: 0, lastError: null, nextAttemptAt: new Date() },
    });
    return result.count;
  }

  async enqueue(appointmentId: string, operation: 'UPSERT' | 'DELETE'): Promise<void> {
    await this.prisma.calendarSync.upsert({
      where: { appointmentId },
      create: { appointmentId, operation, status: 'PENDING' },
      update: {
        operation,
        status: 'PENDING',
        attempts: 0,
        lastError: null,
        nextAttemptAt: new Date(),
      },
    });
  }

  onModuleInit(): void {
    const interval = Number(process.env.GOOGLE_CALENDAR_WORKER_INTERVAL_MS ?? 15_000);

    setInterval(() => void this.processPending(), interval).unref();

    setTimeout(() => void this.processPending(), 2_000).unref();
  }

  private async processPending(): Promise<void> {
    if (this.running) return;

    this.running = true;

    try {
      await this.prisma.calendarSync.updateMany({
        where: { status: 'PROCESSING', updatedAt: { lt: new Date(Date.now() - 2 * 60_000) } },
        data: { status: 'PENDING', nextAttemptAt: new Date() },
      });
      const jobs = await this.prisma.calendarSync.findMany({
        where: { status: 'PENDING', nextAttemptAt: { lte: new Date() } },
        include: { appointment: true },
        orderBy: { createdAt: 'asc' },
        take: 20,
      });

      for (const job of jobs) {
        const claimed = await this.prisma.calendarSync.updateMany({
          where: { id: job.id, operation: job.operation, status: 'PENDING' },
          data: { status: 'PROCESSING' },
        });
        if (claimed.count === 1) await this.processJob(job);
      }
    } catch (_error) {
      this.logger.error('Falha ao buscar tarefas de calendário');
    } finally {
      this.running = false;
    }
  }

  private async processJob(job: CalendarJob): Promise<void> {
    const appointment = job.appointment;

    try {
      const connection = await this.prisma.googleCalendarConnection.findUnique({
        where: { userId: appointment.userId },
      });

      if (!connection) {
        await this.prisma.calendarSync.updateMany({
          where: { id: job.id, operation: job.operation, status: 'PROCESSING' },
          data: { status: 'FAILED', lastError: 'Google Calendar connection is missing' },
        });
        this.logger.warn(`Tarefa ${job.id}: conexão do Google Calendar não encontrada`);
        return;
      }

      const accessToken = await this.accessToken(connection);

      const eventId =
        job.eventId ?? createHash('sha256').update(appointment.id).digest('hex').slice(0, 32);

      const collection = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(connection.calendarId)}/events`;
      const endpoint = `${collection}/${eventId}`;

      if (job.operation === 'DELETE' || appointment.status === 'CANCELLED') {
        const response = await fetch(endpoint, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (!response.ok && response.status !== 404 && response.status !== 410)
          throw new Error(`Calendar API ${response.status}`);
        await this.prisma.calendarSync.updateMany({
          where: { id: job.id, operation: job.operation, status: 'PROCESSING' },
          data: { status: 'SUCCEEDED', syncedAt: new Date(), lastError: null },
        });

        return;
      }
      if (appointment.status !== 'CONFIRMED') {
        await this.prisma.calendarSync.updateMany({
          where: { id: job.id, operation: job.operation, status: 'PROCESSING' },
          data: { status: 'SUCCEEDED', syncedAt: new Date() },
        });

        return;
      }
      const end = new Date(appointment.scheduledAt.getTime() + appointment.duration * 60_000);

      const body = JSON.stringify({
        id: eventId,
        summary: `${appointment.galeryTitle ?? 'Agendamento'} — ${appointment.clientName}`,
        description: `Agendamento Book Tattoo: ${appointment.id}`,
        start: { dateTime: appointment.scheduledAt.toISOString() },
        end: { dateTime: end.toISOString() },
        extendedProperties: { private: { booktattooAppointmentId: appointment.id } },
      });

      const headers = {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      };
      let response = await fetch(collection, { method: 'POST', headers, body });
      if (response.status === 409) {
        response = await fetch(endpoint, { method: 'PUT', headers, body });
        if (response.status === 404)
          response = await fetch(collection, { method: 'POST', headers, body });
      }
      if (!response.ok) throw new Error(`Calendar API ${response.status}`);

      await this.prisma.calendarSync.updateMany({
        where: { id: job.id, operation: job.operation, status: 'PROCESSING' },
        data: { eventId, status: 'SUCCEEDED', syncedAt: new Date(), lastError: null },
      });
    } catch (error) {
      const attempts = job.attempts + 1;
      const detail = error instanceof Error ? error.message : String(error);
      const message = /invalid_grant/i.test(detail)
        ? 'Google authorization revoked'
        : 'Google Calendar synchronization failed';
      this.logger.error(`Falha ao sincronizar tarefa ${job.id}: ${detail}`);
      if (message === 'Google authorization revoked')
        await this.prisma.googleCalendarConnection
          .update({ where: { userId: appointment.userId }, data: { status: 'REAUTH_REQUIRED' } })
          .catch(() => undefined);
      await this.prisma.calendarSync.updateMany({
        where: { id: job.id, operation: job.operation, status: 'PROCESSING' },
        data: {
          attempts,
          status: attempts >= MAX_ATTEMPTS ? 'FAILED' : 'PENDING',
          lastError: message,
          nextAttemptAt: new Date(
            Date.now() + Math.min(6 * 60 * 60_000, 15_000 * 2 ** Math.min(attempts, 10)),
          ),
        },
      });
    }
  }

  private async accessToken(connection: {
    refreshTokenEncrypted: string;
    userId: string;
  }): Promise<string> {
    try {
      const result = await this.tokenRequest({
        grant_type: 'refresh_token',
        refresh_token: this.decrypt(connection.refreshTokenEncrypted),
      });
      return result.access_token;
    } catch (error) {
      if (error instanceof Error && /invalid_grant/i.test(error.message))
        await this.prisma.googleCalendarConnection.update({
          where: { userId: connection.userId },
          data: { status: 'REAUTH_REQUIRED' },
        });
      throw error;
    }
  }

  private async tokenRequest(params: Record<string, string>): Promise<GoogleTokenResponse> {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        ...params,
        client_id: this.required('GOOGLE_CALENDAR_CLIENT_ID'),
        client_secret: this.required('GOOGLE_CALENDAR_CLIENT_SECRET'),
      }),
    });
    const data = (await response.json()) as GoogleTokenResponse;
    if (!response.ok) throw new Error(data.error ?? 'Google OAuth failed');
    return data;
  }

  private key(): Buffer {
    const raw = this.required('GOOGLE_CALENDAR_ENCRYPTION_KEY');

    const key = /^[0-9a-f]{64}$/i.test(raw) ? Buffer.from(raw, 'hex') : Buffer.from(raw, 'base64');

    if (key.length !== 32) throw new Error('GOOGLE_CALENDAR_ENCRYPTION_KEY must be 32 bytes');

    return key;
  }

  private encrypt(value: string): string {
    const iv = randomBytes(12);
    const cipher = createCipheriv('aes-256-gcm', this.key(), iv);

    const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);

    return `${iv.toString('base64')}.${cipher.getAuthTag().toString('base64')}.${encrypted.toString('base64')}`;
  }

  private decrypt(value: string): string {
    const [iv, tag, body] = value.split('.');
    const decipher = createDecipheriv('aes-256-gcm', this.key(), Buffer.from(iv, 'base64'));

    decipher.setAuthTag(Buffer.from(tag, 'base64'));

    return Buffer.concat([decipher.update(Buffer.from(body, 'base64')), decipher.final()]).toString(
      'utf8',
    );
  }

  private required(name: string): string {
    const value = process.env[name];
    if (!value) throw new Error(`${name} is required`);
    return value;
  }
}
