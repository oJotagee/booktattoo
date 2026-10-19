import type { MailPort, SendMailInput } from '@bookink/shared/mail';
import { beforeEach, describe, expect, it, mock } from 'bun:test';

import { MailAppointmentNotifier } from '@/infrastructure/mail/mail-appointment-notifier';
import { buildArtistSnapshot, createArtistGatewayMock } from '@tests/unit/support/mocks';
import { buildAppointment } from '@tests/unit/support/builders';

const config = {
  userServiceUrl: '',
  catalogServiceUrl: '',
  paymentServiceUrl: '',
  internalApiSecret: '',
  frontendUrl: 'http://localhost:3000',
};

function sentMail(mail: MailPort): SendMailInput {
  return (mail.send as ReturnType<typeof mock>).mock.calls[0][0] as SendMailInput;
}

describe('MailAppointmentNotifier', () => {
  let mail: MailPort;
  let notifier: MailAppointmentNotifier;

  beforeEach(() => {
    mail = { send: mock(async () => undefined) };
    notifier = new MailAppointmentNotifier(
      mail,
      createArtistGatewayMock(buildArtistSnapshot({ name: 'Ana <b>Lima</b>' })),
      config,
    );
  });

  it('sends the confirmation to the client with the studio date and amounts', async () => {
    const appointment = buildAppointment().confirmPayment(new Date());

    await notifier.confirmed(appointment);

    const email = sentMail(mail);
    expect(email.to).toBe('mariana@email.com');
    expect(email.subject).toBe('Agendamento confirmado — Rosa Tradicional');
    expect(email.text).toContain('20 de outubro de 2026');
    expect(email.text).toContain('10:00');
    expect(email.text).toMatch(/Sinal pago: R\$\s80,00/);
    expect(email.text).toMatch(/Restante a pagar no estúdio: R\$\s200,00/);
    expect(email.html).toContain('http://localhost:3000/user-1');
  });

  it('escapes client and artist data in the html', async () => {
    const appointment = buildAppointment({ clientName: '<script>alert(1)</script> Silva' });

    await notifier.confirmed(appointment);

    const { html } = sentMail(mail);
    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;script&gt;');
    expect(html).toContain('Ana &lt;b&gt;Lima&lt;/b&gt;');
  });

  it('tells the client the deposit was refunded on cancellation', async () => {
    await notifier.cancelledWithRefund(buildAppointment());

    const email = sentMail(mail);
    expect(email.subject).toBe('Agendamento cancelado — sinal estornado');
    expect(email.text).toMatch(/Estornamos o sinal de R\$\s80,00/);
  });

  it('falls back to a generic artist name when the lookup fails', async () => {
    notifier = new MailAppointmentNotifier(
      mail,
      {
        findById: async () => {
          throw new Error('user-service fora do ar');
        },
      },
      config,
    );

    await notifier.cancelledWithRefund(buildAppointment());

    expect(sentMail(mail).text).toContain('O tatuador cancelou');
  });

  it('swallows mail failures', async () => {
    mail.send = mock(async () => {
      throw new Error('SMTP indisponível');
    });

    await expect(notifier.latePaymentRefunded(buildAppointment())).resolves.toBeUndefined();
  });
});
