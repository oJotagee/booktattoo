import { escapeHtml, renderBrandEmail } from '@bookink/shared/mail';

import type { BookingOfferEntity } from '@/domain/entities/booking-offer.entity';
import type {
  BookingRequestEntity,
  BookingRequestMessageEntity,
} from '@/domain/entities/booking-request.entity';
import { formatBRL, formatStudioDateTime } from '@/domain/format';
import { type AppointmentEmail, details, firstName, paragraph } from './appointment-emails';

const PREVIEW_MAX_LENGTH = 280;

export type ClientEmailContext = {
  request: BookingRequestEntity;
  message: BookingRequestMessageEntity;
  artistName: string;
  conversationUrl: string;
};

export type ArtistEmailContext = {
  request: BookingRequestEntity;
  message: BookingRequestMessageEntity;
  artistName: string;
  dashboardUrl: string;
};

function preview(body: string): string {
  return body.length > PREVIEW_MAX_LENGTH ? `${body.slice(0, PREVIEW_MAX_LENGTH)}…` : body;
}

function quote(body: string): string {
  return `<blockquote style="margin:0 0 12px 0;padding:8px 12px;border-left:3px solid #ea580c;white-space:pre-wrap;">${escapeHtml(preview(body))}</blockquote>`;
}

const SAVE_LINK_NOTICE =
  'Guarde este e-mail: o botão abaixo é o seu acesso à conversa, sem precisar de cadastro.';

export function conversationOpenedEmail({
  request,
  artistName,
  conversationUrl,
}: ClientEmailContext): AppointmentEmail {
  const name = firstName(request.clientName);

  return {
    subject: `Sua conversa com ${artistName} foi aberta`,
    html: renderBrandEmail({
      preheader: `${artistName} recebeu sua mensagem e vai responder por lá.`,
      heading: 'Mensagem enviada',
      bodyHtml:
        paragraph(`Olá, ${escapeHtml(name)}!`) +
        paragraph(
          `${escapeHtml(artistName)} recebeu sua mensagem. Avisamos por e-mail quando chegar uma resposta.`,
        ) +
        paragraph(escapeHtml(SAVE_LINK_NOTICE), true),
      ctaLabel: 'Abrir conversa',
      ctaUrl: conversationUrl,
      footerNote: 'Você recebeu este e-mail porque enviou uma mensagem pelo BookTattoo.',
    }),
    text: [
      `Olá, ${name}!`,
      `${artistName} recebeu sua mensagem. Avisamos por e-mail quando chegar uma resposta.`,
      SAVE_LINK_NOTICE,
      `Abrir conversa: ${conversationUrl}`,
    ].join('\n'),
  };
}

export function artistRepliedEmail({
  request,
  message,
  artistName,
  conversationUrl,
}: ClientEmailContext): AppointmentEmail {
  const name = firstName(request.clientName);

  return {
    subject: `${artistName} respondeu sua mensagem`,
    html: renderBrandEmail({
      preheader: preview(message.body),
      heading: 'Nova resposta',
      bodyHtml:
        paragraph(`Olá, ${escapeHtml(name)}!`) +
        paragraph(`${escapeHtml(artistName)} respondeu:`) +
        quote(message.body),
      ctaLabel: 'Responder',
      ctaUrl: conversationUrl,
      footerNote: 'Você recebeu este e-mail porque tem uma conversa aberta no BookTattoo.',
    }),
    text: [
      `Olá, ${name}!`,
      `${artistName} respondeu:`,
      preview(message.body),
      `Responder: ${conversationUrl}`,
    ].join('\n'),
  };
}

export function newRequestEmail({
  request,
  message,
  artistName,
  dashboardUrl,
}: ArtistEmailContext): AppointmentEmail {
  return {
    subject: `Novo pedido de ${request.clientName}`,
    html: renderBrandEmail({
      preheader: preview(message.body),
      heading: 'Novo pedido',
      bodyHtml:
        paragraph(`Olá, ${escapeHtml(firstName(artistName))}!`) +
        paragraph(`<strong>${escapeHtml(request.clientName)}</strong> enviou uma mensagem:`) +
        quote(message.body),
      ctaLabel: 'Responder no painel',
      ctaUrl: dashboardUrl,
    }),
    text: [
      `${request.clientName} enviou uma mensagem:`,
      preview(message.body),
      `Responder no painel: ${dashboardUrl}`,
    ].join('\n'),
  };
}

export function clientRepliedEmail({
  request,
  message,
  artistName,
  dashboardUrl,
}: ArtistEmailContext): AppointmentEmail {
  return {
    subject: `${request.clientName} respondeu`,
    html: renderBrandEmail({
      preheader: preview(message.body),
      heading: 'Nova mensagem',
      bodyHtml:
        paragraph(`Olá, ${escapeHtml(firstName(artistName))}!`) +
        paragraph(`<strong>${escapeHtml(request.clientName)}</strong> respondeu:`) +
        quote(message.body),
      ctaLabel: 'Responder no painel',
      ctaUrl: dashboardUrl,
    }),
    text: [
      `${request.clientName} respondeu:`,
      preview(message.body),
      `Responder no painel: ${dashboardUrl}`,
    ].join('\n'),
  };
}

export type OfferEmailContext = {
  request: BookingRequestEntity;
  offer: BookingOfferEntity;
  artistName: string;
  conversationUrl: string;
};

export function offerSentEmail({
  request,
  offer,
  artistName,
  conversationUrl,
}: OfferEmailContext): AppointmentEmail {
  const name = firstName(request.clientName);
  const rows: Array<[string, string]> = [
    ['Tatuagem', offer.title],
    ['Data', formatStudioDateTime(offer.scheduledAt)],
    ['Valor total', formatBRL(offer.price)],
    ['Sinal para confirmar', formatBRL(offer.depositAmount)],
    ['Restante a pagar no estúdio', formatBRL(offer.price - offer.depositAmount)],
  ];
  const notice =
    'O horário só fica garantido depois do pagamento do sinal. Se preferir outra data, responda pela conversa.';

  return {
    subject: `${artistName} enviou uma proposta de agendamento`,
    html: renderBrandEmail({
      preheader: `${offer.title}: ${formatStudioDateTime(offer.scheduledAt)}.`,
      heading: 'Proposta de agendamento',
      bodyHtml:
        paragraph(`Olá, ${escapeHtml(name)}!`) +
        paragraph(`${escapeHtml(artistName)} enviou uma proposta para a sua tatuagem:`) +
        details(rows) +
        paragraph(escapeHtml(notice), true),
      ctaLabel: 'Ver proposta e pagar o sinal',
      ctaUrl: conversationUrl,
      footerNote: 'Você recebeu este e-mail porque tem uma conversa aberta no BookTattoo.',
    }),
    text: [
      `Olá, ${name}!`,
      `${artistName} enviou uma proposta para a sua tatuagem:`,
      ...rows.map(([label, value]) => `${label}: ${value}`),
      notice,
      `Ver proposta e pagar o sinal: ${conversationUrl}`,
    ].join('\n'),
  };
}
