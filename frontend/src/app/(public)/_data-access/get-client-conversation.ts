'use server';

import { isAxiosError } from 'axios';

import type {
  BookingOffer,
  ConversationMessage,
  ConversationStatus,
} from '@/components/conversation/types';
import { bookingTokenHeaders, isBookingToken } from '@/lib/booking-token';
import { api } from '@/lib/api';

export interface ClientConversation {
  id: string;
  status: ConversationStatus;
  clientName: string;
  artistId: string;
  artistName: string;
  closedAt: string | null;
  createdAt: string;
  messages: ConversationMessage[];
  offer: BookingOffer | null;
}

export async function getClientConversation(token: string): Promise<ClientConversation | null> {
  if (!isBookingToken(token)) return null;

  try {
    const { data } = await api.get<ClientConversation>('/public/booking-requests/conversation', {
      headers: bookingTokenHeaders(token),
    });

    return data;
  } catch (error) {
    if (isAxiosError(error) && error.response?.status === 404) return null;

    throw new Error(error instanceof Error ? error.message : String(error));
  }
}
