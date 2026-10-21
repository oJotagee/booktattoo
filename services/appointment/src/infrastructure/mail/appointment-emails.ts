import { escapeHtml, renderBrandEmail } from '@bookink/shared/mail';

import type { AppointmentEntity } from '@/domain/entities/appointment.entity';
import { formatBRL, formatStudioDateTime } from '@/domain/format';

export type AppointmentEmailContext = {
  appointment: AppointmentEntity;
  artistName: string;
  artistUrl: string;
};

export type AppointmentEmail = {
  subject: string;
  html: string;
  text: string;
};

export { formatBRL, formatStudioDateTime };

export function firstName(fullName: string): string {
  return fullName.split(/\s+/)[0] || fullName;
}

export function paragraph(html: string, last = false): string {
  return `<p style="margin:0 0 ${last ? 0 : 12}px 0;">${html}</p>`;
}

export function details(rows: Array<[string, string]>): string {
  const items = rows
    .map(([label, value]) => `<li><strong>${escapeHtml(label)}:</strong> ${escapeHtml(value)}</li>`)
    .join('');

  return `<ul style="margin:0 0 12px 0;padding-left:18px;">${items}</ul>`;
}

export function confirmedEmail({
  appointment,
  artistName,
  artistUrl,
}: AppointmentEmailContext): AppointmentEmail {
  const when = formatStudioDateTime(appointment.scheduledAt);
  const title = appointment.galeryTitle ?? 'Flash';
  const name = firstName(appointment.clientName);
  const rows: Array<[string, string]> = [
    ['Tatuador', artistName],
    ['Flash', title],
    ['Data', when],
    ['Sinal pago', formatBRL(appointment.depositAmount)],
    ['Restante a pagar no estúdio', formatBRL(appointment.price - appointment.depositAmount)],
  ];

  return {
    subject: `Agendamento confirmado — ${title}`,
    html: renderBrandEmail({
      preheader: `Seu horário com ${artistName} está garantido: ${when}.`,
      heading: 'Agendamento confirmado',
      bodyHtml:
        paragraph(`Olá, ${escapeHtml(name)}!`) +
        paragraph('Recebemos o pagamento do sinal e seu horário está garantido.') +
        details(rows) +
        paragraph('Se precisar remarcar ou cancelar, fale direto com o tatuador.', true),
      ctaLabel: 'Ver perfil do tatuador',
      ctaUrl: artistUrl,
      footerNote: 'Você recebeu este e-mail porque fez um agendamento no BookTattoo.',
    }),
    text: [
      `Olá, ${name}!`,
      'Recebemos o pagamento do sinal e seu horário está garantido.',
      ...rows.map(([label, value]) => `${label}: ${value}`),
      `Perfil do tatuador: ${artistUrl}`,
    ].join('\n'),
  };
}

export function cancelledWithRefundEmail({
  appointment,
  artistName,
  artistUrl,
}: AppointmentEmailContext): AppointmentEmail {
  const when = formatStudioDateTime(appointment.scheduledAt);
  const amount = formatBRL(appointment.depositAmount);
  const name = firstName(appointment.clientName);
  const refundNotice = `Estornamos o sinal de ${amount} para o cartão usado no pagamento. O valor aparece na fatura em até 10 dias úteis, conforme o banco emissor.`;

  return {
    subject: 'Agendamento cancelado — sinal estornado',
    html: renderBrandEmail({
      preheader: `Seu agendamento de ${when} foi cancelado e o sinal de ${amount} foi estornado.`,
      heading: 'Agendamento cancelado',
      bodyHtml:
        paragraph(`Olá, ${escapeHtml(name)}.`) +
        paragraph(
          `${escapeHtml(artistName)} cancelou o agendamento de <strong>${escapeHtml(when)}</strong>.`,
        ) +
        paragraph(escapeHtml(refundNotice), true),
      ctaLabel: 'Escolher outro horário',
      ctaUrl: artistUrl,
    }),
    text: [
      `Olá, ${name}.`,
      `${artistName} cancelou o agendamento de ${when}.`,
      refundNotice,
      `Escolher outro horário: ${artistUrl}`,
    ].join('\n'),
  };
}

export function latePaymentRefundedEmail({
  appointment,
  artistUrl,
}: AppointmentEmailContext): AppointmentEmail {
  const when = formatStudioDateTime(appointment.scheduledAt);
  const amount = formatBRL(appointment.depositAmount);
  const name = firstName(appointment.clientName);
  const explanation = `O pagamento do sinal chegou depois que a reserva de ${when} expirou ou foi cancelada, então o horário não pôde ser confirmado.`;
  const refundNotice = `Estornamos ${amount} para o cartão usado. O valor aparece na fatura em até 10 dias úteis, conforme o banco emissor.`;

  return {
    subject: 'Pagamento do sinal estornado',
    html: renderBrandEmail({
      preheader: `O pagamento chegou depois que a reserva de ${when} expirou. Estornamos ${amount}.`,
      heading: 'Pagamento estornado',
      bodyHtml:
        paragraph(`Olá, ${escapeHtml(name)}.`) +
        paragraph(escapeHtml(explanation)) +
        paragraph(escapeHtml(refundNotice), true),
      ctaLabel: 'Escolher outro horário',
      ctaUrl: artistUrl,
    }),
    text: [`Olá, ${name}.`, explanation, refundNotice, `Escolher outro horário: ${artistUrl}`].join(
      '\n',
    ),
  };
}
