import type { MailPort, SendMailInput } from '@bookink/shared/mail';
import { beforeEach, describe, expect, it, mock } from 'bun:test';

import { MailBookingRequestNotifier } from '@/infrastructure/mail/mail-booking-request-notifier';
import { MessageAuthor } from '@/domain/entities/booking-request.entity';
import { buildBookingRequest, buildMessage } from '@tests/unit/support/builders';
import {
  buildArtistSnapshot,
  createArtistGatewayMock,
  createBookingLinkMock,
} from '@tests/unit/support/mocks';

const config = {
  userServiceUrl: '',
  catalogServiceUrl: '',
  paymentServiceUrl: '',
  internalApiSecret: '',
  frontendUrl: 'http://localhost:3000',
  bookingLinkSecret: '',
};

function sentMails(mail: MailPort): SendMailInput[] {
  return (mail.send as ReturnType<typeof mock>).mock.calls.map(([input]) => input as SendMailInput);
}

describe('MailBookingRequestNotifier', () => {
  let mail: MailPort;
  let notifier: MailBookingRequestNotifier;

  beforeEach(() => {
    mail = { send: mock(async () => undefined) };
    notifier = new MailBookingRequestNotifier(
      mail,
      createArtistGatewayMock(buildArtistSnapshot({ name: 'Ana <b>Lima</b>' })),
      createBookingLinkMock(),
      config,
    );
  });

  it('sends the conversation link to the client and the dashboard link to the artist', async () => {
    await notifier.opened(buildBookingRequest(), buildMessage());

    const mails = sentMails(mail);
    const client = mails.find((sent) => sent.to === 'mariana@email.com') as SendMailInput;
    const artist = mails.find((sent) => sent.to === 'ana@estudio.com') as SendMailInput;
    expect(mails).toHaveLength(2);
    expect(client.text).toContain('http://localhost:3000/pedido/signed.request-1');
    expect(artist.subject).toBe('Novo pedido de Mariana Costa');
    expect(artist.text).toContain('http://localhost:3000/dashboard/requests/request-1');
  });

  it('quotes the reply and escapes html', async () => {
    await notifier.artistReplied(
      buildBookingRequest(),
      buildMessage({ author: MessageAuthor.ARTIST, body: '<script>x</script> Sexta?' }),
    );

    const [email] = sentMails(mail);
    expect(email.html).not.toContain('<script>');
    expect(email.html).toContain('&lt;script&gt;');
    expect(email.html).toContain('Ana &lt;b&gt;Lima&lt;/b&gt;');
  });

  it('skips the artist email when the contact lookup returns nothing', async () => {
    notifier = new MailBookingRequestNotifier(
      mail,
      { findById: async () => null, findContact: async () => null },
      createBookingLinkMock(),
      config,
    );

    await notifier.clientReplied(buildBookingRequest(), buildMessage());

    expect(mail.send).not.toHaveBeenCalled();
  });

  it('never throws when sending fails', async () => {
    mail.send = mock(async () => {
      throw new Error('SMTP fora do ar');
    });

    await expect(notifier.opened(buildBookingRequest(), buildMessage())).resolves.toBeUndefined();
  });
});
