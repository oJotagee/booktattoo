import { beforeEach, describe, expect, it, type mock } from 'bun:test';

import type { BookingRequestEntity } from '@/domain/entities/booking-request.entity';

import { FindArtistBookingRequestsUseCase } from '@/application/use-cases/booking-request/find-artist-booking-requests.use-case';
import { FindArtistBookingRequestUseCase } from '@/application/use-cases/booking-request/find-artist-booking-request.use-case';
import { CloseBookingRequestUseCase } from '@/application/use-cases/booking-request/close-booking-request.use-case';
import { SendArtistMessageUseCase } from '@/application/use-cases/booking-request/send-artist-message.use-case';
import { BookingRequestStatus, MessageAuthor } from '@/domain/entities/booking-request.entity';
import { ForbiddenResourceAccessError } from '@/domain/errors/authorization.error';
import {
  BookingRequestClosedError,
  BookingRequestNotFoundError,
} from '@/domain/errors/booking-request.error';
import { buildBookingRequest, buildMessage } from '@tests/unit/support/builders';
import {
  createBookingOfferRepositoryMock,
  createBookingRequestNotifierMock,
  createBookingRequestRepositoryMock,
} from '@tests/unit/support/mocks';

describe('FindArtistBookingRequestsUseCase', () => {
  it('flags conversations waiting for the artist and paginates', async () => {
    const requests = createBookingRequestRepositoryMock();
    requests.findByUser = async () => ({
      items: [
        { request: buildBookingRequest({ id: 'a' }), lastMessage: buildMessage() },
        {
          request: buildBookingRequest({ id: 'b' }),
          lastMessage: buildMessage({ author: MessageAuthor.ARTIST }),
        },
      ],
      total: 12,
    });

    const result = await new FindArtistBookingRequestsUseCase(requests).execute({
      userId: 'user-1',
      limit: 10,
      offset: 10,
    });

    expect(result.list.map((item) => item.awaitingReply)).toEqual([true, false]);
    expect(result.pagination).toEqual({ total: 12, page: 2, perPage: 10, totalPages: 2 });
  });

  it('lists open conversations by default', async () => {
    const requests = createBookingRequestRepositoryMock();

    await new FindArtistBookingRequestsUseCase(requests).execute({ userId: 'user-1' });

    expect(requests.findByUser).toHaveBeenCalledWith({
      userId: 'user-1',
      status: BookingRequestStatus.OPEN,
      limit: 10,
      offset: 0,
    });
  });
});

describe('artist actions on a conversation', () => {
  let requests: ReturnType<typeof createBookingRequestRepositoryMock>;
  let notifier: ReturnType<typeof createBookingRequestNotifierMock>;

  beforeEach(() => {
    requests = createBookingRequestRepositoryMock();
    requests.findById = async () => buildBookingRequest();
    notifier = createBookingRequestNotifierMock();
  });

  it('returns the thread to its owner', async () => {
    requests.messages = [buildMessage()];

    const result = await new FindArtistBookingRequestUseCase(
      requests,
      createBookingOfferRepositoryMock(),
    ).execute({
      id: 'request-1',
      userId: 'user-1',
    });

    expect(result.clientPhone).toBe('11999999999');
    expect(result.messages).toHaveLength(1);
  });

  it('blocks other artists from reading, replying or closing', async () => {
    const params = { id: 'request-1', userId: 'intruder' };

    await expect(
      new FindArtistBookingRequestUseCase(requests, createBookingOfferRepositoryMock()).execute(
        params,
      ),
    ).rejects.toThrow(ForbiddenResourceAccessError);
    await expect(
      new SendArtistMessageUseCase(requests, notifier).execute({ ...params, body: 'oi' }),
    ).rejects.toThrow(ForbiddenResourceAccessError);
    await expect(
      new CloseBookingRequestUseCase(requests, createBookingOfferRepositoryMock()).execute(params),
    ).rejects.toThrow(ForbiddenResourceAccessError);
  });

  it('answers as the artist and emails the client', async () => {
    const message = await new SendArtistMessageUseCase(requests, notifier).execute({
      id: 'request-1',
      userId: 'user-1',
      body: 'Consigo na sexta.',
    });

    expect(message.author).toBe(MessageAuthor.ARTIST);
    expect(notifier.artistReplied).toHaveBeenCalledTimes(1);
  });

  it('closes the conversation and refuses replies afterwards', async () => {
    await new CloseBookingRequestUseCase(requests, createBookingOfferRepositoryMock()).execute({
      id: 'request-1',
      userId: 'user-1',
    });

    const closed = (requests.update as ReturnType<typeof mock>).mock
      .calls[0][0] as BookingRequestEntity;
    expect(closed.status).toBe(BookingRequestStatus.CLOSED);

    requests.findById = async () => buildBookingRequest().close();
    await expect(
      new SendArtistMessageUseCase(requests, notifier).execute({
        id: 'request-1',
        userId: 'user-1',
        body: 'oi',
      }),
    ).rejects.toThrow(BookingRequestClosedError);
  });

  it('reports missing conversations', async () => {
    requests.findById = async () => null;

    await expect(
      new CloseBookingRequestUseCase(requests, createBookingOfferRepositoryMock()).execute({
        id: 'nope',
        userId: 'user-1',
      }),
    ).rejects.toThrow(BookingRequestNotFoundError);
  });
});
