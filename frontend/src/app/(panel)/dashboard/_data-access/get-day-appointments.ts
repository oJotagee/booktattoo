'use server';

import { getAccessToken } from '@/lib/get-access-token';
import { api } from '@/lib/api';

export type AppointmentStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';

export interface DayAppointment {
  id: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  scheduledAt: string;
  time: string;
  duration: number;
  price: number;
  depositAmount: number;
  status: AppointmentStatus;
  galeryId: string | null;
  galeryTitle: string | null;
  galeryImageUrl: string | null;
  paidAt: string | null;
  refundedAt: string | null;
  bookingRequestId: string | null;
}

export async function getDayAppointments({ date }: { date: string }): Promise<DayAppointment[]> {
  const accessToken = await getAccessToken();
  if (!accessToken) throw new Error('Usuário não autenticado');

  try {
    const appointments = await api.get<DayAppointment[]>('/appointments', {
      params: { date },
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    return appointments.data;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : String(error));
  }
}
