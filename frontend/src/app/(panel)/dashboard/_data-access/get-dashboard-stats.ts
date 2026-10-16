'use server';

import { isAxiosError } from 'axios';

import { getAccessToken } from '@/lib/get-access-token';
import { api } from '@/lib/api';

export interface AppointmentStats {
  todayConfirmed: number;
  todayPending: number;
  reservedFlashes: number;
  depositsThisMonth: number;
}

export interface GaleryStats {
  total: number;
  available: number;
}

export interface DashboardStats {
  appointments: AppointmentStats | null;
  galeries: GaleryStats | null;
}

function warnFailure(path: string, reason: unknown) {
  const status = isAxiosError(reason) ? (reason.response?.status ?? 'sem resposta') : 'erro';
  const message = reason instanceof Error ? reason.message : String(reason);

  console.warn(`Indicadores do dashboard: ${path} falhou (${status}): ${message}`);
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const accessToken = await getAccessToken();
  if (!accessToken) throw new Error('Usuário não autenticado');

  const headers = { Authorization: `Bearer ${accessToken}` };

  const [appointments, galeries] = await Promise.allSettled([
    api.get<AppointmentStats>('/appointments/stats', { headers }),
    api.get<GaleryStats>('/galeries/stats', { headers }),
  ]);

  // Falha já tratada (o card mostra "—"); warn em vez de error para não poluir o overlay do Next
  if (appointments.status === 'rejected') warnFailure('/appointments/stats', appointments.reason);
  if (galeries.status === 'rejected') warnFailure('/galeries/stats', galeries.reason);

  return {
    appointments: appointments.status === 'fulfilled' ? appointments.value.data : null,
    galeries: galeries.status === 'fulfilled' ? galeries.value.data : null,
  };
}
