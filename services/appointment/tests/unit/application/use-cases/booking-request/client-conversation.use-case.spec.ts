import { beforeEach, describe, expect, it, type mock } from 'bun:test';

import type { CreateWithFirstMessageParams } from '@/application/port/booking-request-repository.port';

import { CreateBookingRequestUseCase } from '@/application/use-cases/booking-request/create-booking-request.use-case';
import { FindClientConversationUseCase } from '@/application/use-cases/booking-request/find-client-conversation.use-case';
import { SendClientMessageUseCase } from '@/application/use-cases/booking-request/send-client-message.use-case';
import { MessageAuthor } from '@/domain/entities/booking-request.entity';
import {
  BookingRequestClosedError,
  BookingRequestNotFoundError,
  BookingRequestUnavailableError,
  ClientMessageLimitError,
  OpenBookingRequestLimitError,
} from '@/domain/errors/booking-request.error';
import { buildBookingRequest, buildMessage } from '@tests/unit/support/builders';
import {
  buildArtistSnapshot,
  createArtistGatewayMock,
  createBookingLinkMock,
  createBookingOfferRepositoryMock,
  createBookingRequestNotifierMock,
  createBookingRequestRepositoryMock,
} from '@tests/unit/support/mocks';

const input = {
  artistId: 'user-1',
  name: 'Mariana Costa',
  email: 'mariana@email.com',
  phone: '(11) 99999-9999',
  message: 'Quero uma rosa fineline no antebraço.',
};

describe('CreateBookingRequestUseCase', () => {
  it('opens the conversation, notifies both sides and returns the signed token', async () => {
    const requests = createBookingRequestRepositoryMock();
    const notifier = createBookingRequestNotifierMock();
    const useCase = new CreateBookingRequestUseCase(
      requests,
      createArtistGatewayMock(),
      createBookingLinkMock(),
      notifier,
    );

    const { token } = await useCase.execute(input);

    const { request, message } = (requests.createWithFirstMessage as ReturnType<typeof mock>).mock
      .calls[0][0] as CreateWithFirstMessageParams;
    expect(token).toBe(`signed.${request.id}`);
    expect(request.userId).toBe('user-1');
    expect(message.author).toBe(MessageAuthor.CLIENT);
    expect(notifier.opened).toHaveBeenCalledTimes(1);
  });

  it('accepts artists that have not connected Stripe yet', async () => {
    const useCase = new CreateBookingRequestUseCase(
      createBookingRequestRepositoryMock(),
      createArtistGatewayMock(buildArtistSnapshot({ paymentsEnabled: false })),
      createBookingLinkMock(),
      createBookingRequestNotifierMock(),
    );

    await expect(useCase.execute(input)).resolves.toHaveProperty('token');
  });

  it.each([
    null,
    buildArtistSnapshot({ status: 'VACATION' }),
  ])('refuses when the artist is not active (%#)', async (artist) => {
    const useCase = new CreateBookingRequestUseCase(
      createBookingRequestRepositoryMock(),
      createArtistGatewayMock(artist),
      createBookingLinkMock(),
      createBookingRequestNotifierMock(),
    );

    await expect(useCase.execute(input)).rejects.toThrow(BookingRequestUnavailableError);
  });

  it('refuses a second open conversation with the same artist', async () => {
    const notifier = createBookingRequestNotifierMock();
    const useCase = new CreateBookingRequestUseCase(
      createBookingRequestRepositoryMock({ clientHasOpenRequest: true }),
      createArtistGatewayMock(),
      createBookingLinkMock(),
      notifier,
    );

    await expect(useCase.execute(input)).rejects.toThrow(OpenBookingRequestLimitError);
    expect(notifier.opened).not.toHaveBeenCalled();
  });
});

describe('FindClientConversationUseCase', () => {
  let requests: ReturnType<typeof createBookingRequestRepositoryMock>;
  let useCase: FindClientConversationUseCase;

  beforeEach(() => {
    requests = createBookingRequestRepositoryMock();
    useCase = new FindClientConversationUseCase(
      requests,
      createBookingLinkMock(),
      createArtistGatewayMock(),
      createBookingOfferRepositoryMock(),
    );
  });

  it('returns the thread with the artist name', async () => {
    requests.findById = async () => buildBookingRequest();
    requests.messages = [buildMessage()];

    const conversation = await useCase.execute({ token: 'signed.request-1' });

    expect(conversation.artistName).toBe('Ana Lima');
    expect(conversation.messages).toHaveLength(1);
    expect(conversation).not.toHaveProperty('clientEmail');
  });

  it('hides whether the token is invalid or the request is gone', async () => {
    await expect(useCase.execute({ token: 'forged' })).rejects.toThrow(BookingRequestNotFoundError);
    await expect(useCase.execute({ token: 'signed.missing' })).rejects.toThrow(
      BookingRequestNotFoundError,
    );
  });
});

describe('SendClientMessageUseCase', () => {
  let requests: ReturnType<typeof createBookingRequestRepositoryMock>;
  let notifier: ReturnType<typeof createBookingRequestNotifierMock>;
  let useCase: SendClientMessageUseCase;

  beforeEach(() => {
    requests = createBookingRequestRepositoryMock();
    requests.findById = async () => buildBookingRequest();
    notifier = createBookingRequestNotifierMock();
    useCase = new SendClientMessageUseCase(requests, createBookingLinkMock(), notifier);
  });

  it('stores the message as the client and tells the artist', async () => {
    const message = await useCase.execute({ token: 'signed.request-1', body: 'Pode ser sábado?' });

    expect(message.author).toBe(MessageAuthor.CLIENT);
    expect(requests.addMessage).toHaveBeenCalledTimes(1);
    expect(notifier.clientReplied).toHaveBeenCalledTimes(1);
  });

  it('blocks a sixth message in a row without an answer', async () => {
    requests.messages = Array.from({ length: 5 }, (_, index) => buildMessage({ id: `m${index}` }));

    await expect(useCase.execute({ token: 'signed.request-1', body: 'oi?' })).rejects.toThrow(
      ClientMessageLimitError,
    );
  });

  it('resets the limit after the artist answers', async () => {
    requests.messages = [
      ...Array.from({ length: 5 }, (_, index) => buildMessage({ id: `m${index}` })),
      buildMessage({ id: 'answer', author: MessageAuthor.ARTIST }),
    ];

    await expect(
      useCase.execute({ token: 'signed.request-1', body: 'obrigada!' }),
    ).resolves.toHaveProperty('id');
  });

  it('refuses messages on a closed conversation', async () => {
    requests.findById = async () => buildBookingRequest().close();

    await expect(useCase.execute({ token: 'signed.request-1', body: 'oi' })).rejects.toThrow(
      BookingRequestClosedError,
    );
    expect(requests.addMessage).not.toHaveBeenCalled();
  });
});
