import { Injectable } from '@nestjs/common';

import { BookingRequestMapper } from '../persistence/booking-request.mapper';
import { PrismaService } from '../prisma/prisma.service';
import {
  type BookingRequestEntity,
  type BookingRequestMessageEntity,
  BookingRequestStatus,
} from '@/domain/entities/booking-request.entity';
import type {
  BookingRequestRepository,
  BookingRequestSummary,
  CreateWithFirstMessageParams,
  FindBookingRequestsByUserParams,
} from '@/application/port/booking-request-repository.port';

@Injectable()
export class PrismaBookingRequestRepository implements BookingRequestRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<BookingRequestEntity | null> {
    const request = await this.prisma.bookingRequest.findUnique({ where: { id } });

    return request ? BookingRequestMapper.toDomain(request) : null;
  }

  async findByUser({
    userId,
    status,
    limit,
    offset,
  }: FindBookingRequestsByUserParams): Promise<{ items: BookingRequestSummary[]; total: number }> {
    const [requests, total] = await Promise.all([
      this.prisma.bookingRequest.findMany({
        where: { userId, status },
        orderBy: [{ lastMessageAt: 'desc' }, { id: 'asc' }],
        take: limit,
        skip: offset,
        include: { messages: { orderBy: { createdAt: 'desc' }, take: 1 } },
      }),
      this.prisma.bookingRequest.count({ where: { userId, status } }),
    ]);

    return {
      items: requests.map(({ messages, ...request }) => ({
        request: BookingRequestMapper.toDomain(request),
        lastMessage: messages[0] ? BookingRequestMapper.messageToDomain(messages[0]) : null,
      })),
      total,
    };
  }

  async findMessages(bookingRequestId: string): Promise<BookingRequestMessageEntity[]> {
    const messages = await this.prisma.bookingRequestMessage.findMany({
      where: { bookingRequestId },
      orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
    });

    return messages.map(BookingRequestMapper.messageToDomain);
  }

  // Mesmo advisory lock por tatuador do agendamento: dois envios simultâneos do
  // mesmo cliente não conseguem abrir duas conversas
  async createWithFirstMessage({
    request,
    message,
    assertCanOpen,
  }: CreateWithFirstMessageParams): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${request.userId}))`;

      const openRequests = await tx.bookingRequest.count({
        where: {
          userId: request.userId,
          status: BookingRequestStatus.OPEN,
          OR: [{ clientEmail: request.clientEmail }, { clientPhone: request.clientPhone }],
        },
      });

      assertCanOpen({ clientHasOpenRequest: openRequests > 0 });

      await tx.bookingRequest.create({ data: BookingRequestMapper.toPersistence(request) });
      await tx.bookingRequestMessage.create({
        data: BookingRequestMapper.messageToPersistence(message),
      });
    });
  }

  async addMessage(
    request: BookingRequestEntity,
    message: BookingRequestMessageEntity,
  ): Promise<void> {
    await this.prisma.$transaction([
      this.prisma.bookingRequestMessage.create({
        data: BookingRequestMapper.messageToPersistence(message),
      }),
      this.prisma.bookingRequest.update({
        where: { id: request.id },
        data: { lastMessageAt: request.lastMessageAt, updatedAt: request.updatedAt },
      }),
    ]);
  }

  async update(request: BookingRequestEntity): Promise<void> {
    const { id, ...data } = BookingRequestMapper.toPersistence(request);

    await this.prisma.bookingRequest.update({ where: { id }, data });
  }
}
