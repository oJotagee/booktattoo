import type {
  BookingRequestMessageModel as PrismaBookingRequestMessage,
  BookingRequestModel as PrismaBookingRequest,
} from '@generated/prisma/models';

import {
  BookingRequestEntity,
  BookingRequestMessageEntity,
  type BookingRequestStatus,
  type MessageAuthor,
} from '@/domain/entities/booking-request.entity';

export class BookingRequestMapper {
  static toDomain(request: PrismaBookingRequest): BookingRequestEntity {
    return BookingRequestEntity.restore({
      id: request.id,
      clientName: request.clientName,
      clientEmail: request.clientEmail,
      clientPhone: request.clientPhone,
      status: request.status as BookingRequestStatus,
      lastMessageAt: request.lastMessageAt,
      closedAt: request.closedAt,
      userId: request.userId,
      createdAt: request.createdAt,
      updatedAt: request.updatedAt,
    });
  }

  static toPersistence(request: BookingRequestEntity): PrismaBookingRequest {
    return {
      id: request.id,
      clientName: request.clientName,
      clientEmail: request.clientEmail,
      clientPhone: request.clientPhone,
      status: request.status,
      lastMessageAt: request.lastMessageAt,
      closedAt: request.closedAt,
      userId: request.userId,
      createdAt: request.createdAt,
      updatedAt: request.updatedAt,
    };
  }

  static messageToDomain(message: PrismaBookingRequestMessage): BookingRequestMessageEntity {
    return BookingRequestMessageEntity.restore({
      id: message.id,
      bookingRequestId: message.bookingRequestId,
      author: message.author as MessageAuthor,
      body: message.body,
      createdAt: message.createdAt,
    });
  }

  static messageToPersistence(message: BookingRequestMessageEntity): PrismaBookingRequestMessage {
    return {
      id: message.id,
      bookingRequestId: message.bookingRequestId,
      author: message.author,
      body: message.body,
      createdAt: message.createdAt,
    };
  }
}
