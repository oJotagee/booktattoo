'use server';

import type {
  BookingOffer,
  ConversationMessage,
  ConversationStatus,
  MessageAuthor,
} from '@/components/conversation/types';
import { getAccessToken } from '@/lib/get-access-token';
import { api } from '@/lib/api';

interface GetBookingRequestsProps {
  status: ConversationStatus;
  limit: number;
  offset: number;
}

export interface PaginationBookingRequest {
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

export interface BookingRequestSummary {
  id: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  status: ConversationStatus;
  lastMessageAt: string;
  closedAt: string | null;
  createdAt: string;
  lastMessage: { author: MessageAuthor; body: string; createdAt: string } | null;
  awaitingReply: boolean;
}

export interface BookingRequestDetail
  extends Omit<BookingRequestSummary, 'lastMessage' | 'awaitingReply'> {
  messages: ConversationMessage[];
  offer: BookingOffer | null;
}

interface OutputBookingRequests {
  list: BookingRequestSummary[];
  pagination: PaginationBookingRequest;
}

export async function getBookingRequests({
  status,
  limit,
  offset,
}: GetBookingRequestsProps): Promise<OutputBookingRequests> {
  const accessToken = await getAccessToken();
  if (!accessToken) throw new Error('Usuário não autenticado');

  try {
    const requests = await api.get('/booking-requests', {
      params: {
        status,
        limit,
        offset,
      },
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    return {
      list: requests.data.list,
      pagination: requests.data.pagination,
    };
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : String(error));
  }
}
