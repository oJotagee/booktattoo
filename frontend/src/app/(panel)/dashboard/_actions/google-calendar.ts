'use server';

import { getAccessToken } from '@/lib/get-access-token';
import { api } from '@/lib/api';

async function authHeaders() {
  const token = await getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : null;
}

export async function getCalendarStatus() {
  const headers = await authHeaders();
  if (!headers) return { connected: false, status: 'DISCONNECTED', pending: 0, failed: 0 };
  const { data } = await api.get('/google-calendar/status', { headers });
  return data as { connected: boolean; status: string; pending: number; failed: number };
}

export async function connectCalendar() {
  const headers = await authHeaders();
  if (!headers) return null;
  const { data } = await api.get('/google-calendar/connect', { headers });
  return data.url as string;
}

export async function disconnectCalendar() {
  const headers = await authHeaders();
  if (!headers) throw new Error('Sessão expirada');
  await api.delete('/google-calendar/connection', { headers });
}

export async function retryFailedCalendarSyncs() {
  const headers = await authHeaders();
  if (!headers) throw new Error('Sessão expirada');
  const { data } = await api.post('/google-calendar/retry-failed', undefined, { headers });
  return data.retried as number;
}
