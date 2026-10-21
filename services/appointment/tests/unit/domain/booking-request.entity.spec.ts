import { describe, expect, it } from 'bun:test';

import { BookingRequestStatus, MessageAuthor } from '@/domain/entities/booking-request.entity';
import {
  BookingRequestClosedError,
  InvalidBookingRequestError,
} from '@/domain/errors/booking-request.error';
import { buildBookingRequest, buildMessage } from '@tests/unit/support/builders';

describe('BookingRequestEntity', () => {
  it('opens with normalized client contact', () => {
    const request = buildBookingRequest();

    expect(request.status).toBe(BookingRequestStatus.OPEN);
    expect(request.clientEmail).toBe('mariana@email.com');
    expect(request.clientPhone).toBe('11999999999');
    expect(request.closedAt).toBeNull();
  });

  it('moves lastMessageAt forward when a message arrives', () => {
    const request = buildBookingRequest();
    const message = buildMessage({ author: MessageAuthor.ARTIST });

    expect(request.receiveMessage(message).lastMessageAt).toBe(message.createdAt);
  });

  it('closes once and then rejects messages and a second close', () => {
    const closed = buildBookingRequest().close();

    expect(closed.status).toBe(BookingRequestStatus.CLOSED);
    expect(closed.closedAt).toBeInstanceOf(Date);
    expect(() => closed.receiveMessage(buildMessage())).toThrow(BookingRequestClosedError);
    expect(() => closed.close()).toThrow(BookingRequestClosedError);
  });
});

describe('BookingRequestMessageEntity', () => {
  it('trims the body', () => {
    expect(buildMessage({ body: '  oi  ' }).body).toBe('oi');
  });

  it('rejects empty and too long bodies', () => {
    expect(() => buildMessage({ body: '   ' })).toThrow(InvalidBookingRequestError);
    expect(() => buildMessage({ body: 'a'.repeat(2001) })).toThrow(InvalidBookingRequestError);
  });
});
