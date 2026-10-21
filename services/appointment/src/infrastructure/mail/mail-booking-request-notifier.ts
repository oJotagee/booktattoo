import { MAIL_PORT, type MailPort } from '@bookink/shared/mail';
import type { ConfigType } from '@nestjs/config';
import { Inject, Injectable, Logger } from '@nestjs/common';

import type { BookingRequestNotifier } from '@/application/port/booking-request-notifier.port';
import type { BookingOfferEntity } from '@/domain/entities/booking-offer.entity';
import { ARTIST_GATEWAY, type ArtistGateway } from '@/application/port/artist-gateway.port';
import { BOOKING_LINK, type BookingLink } from '@/application/port/booking-link.port';
import type {
  BookingRequestEntity,
  BookingRequestMessageEntity,
} from '@/domain/entities/booking-request.entity';
import servicesConfig from '../config/services.config';
import type { AppointmentEmail } from './appointment-emails';
import {
  type ArtistEmailContext,
  artistRepliedEmail,
  type ClientEmailContext,
  clientRepliedEmail,
  conversationOpenedEmail,
  newRequestEmail,
  offerSentEmail,
} from './booking-request-emails';

const FALLBACK_ARTIST_NAME = 'O tatuador';

@Injectable()
export class MailBookingRequestNotifier implements BookingRequestNotifier {
  private readonly logger = new Logger(MailBookingRequestNotifier.name);

  constructor(
    @Inject(MAIL_PORT)
    private readonly mail: MailPort,
    @Inject(ARTIST_GATEWAY)
    private readonly artists: ArtistGateway,
    @Inject(BOOKING_LINK)
    private readonly links: BookingLink,
    @Inject(servicesConfig.KEY)
    private readonly config: ConfigType<typeof servicesConfig>,
  ) {}

  async opened(request: BookingRequestEntity, message: BookingRequestMessageEntity): Promise<void> {
    await Promise.all([
      this.notifyClient(request, (context) => conversationOpenedEmail({ ...context, message })),
      this.notifyArtist(request, message, newRequestEmail),
    ]);
  }

  clientReplied(
    request: BookingRequestEntity,
    message: BookingRequestMessageEntity,
  ): Promise<void> {
    return this.notifyArtist(request, message, clientRepliedEmail);
  }

  artistReplied(
    request: BookingRequestEntity,
    message: BookingRequestMessageEntity,
  ): Promise<void> {
    return this.notifyClient(request, (context) => artistRepliedEmail({ ...context, message }));
  }

  offerSent(request: BookingRequestEntity, offer: BookingOfferEntity): Promise<void> {
    return this.notifyClient(request, (context) => offerSentEmail({ ...context, offer }));
  }

  private async notifyClient(
    request: BookingRequestEntity,
    render: (context: Omit<ClientEmailContext, 'message'>) => AppointmentEmail,
  ): Promise<void> {
    try {
      const artist = await this.artists.findById(request.userId).catch(() => null);
      const email = render({
        request,
        artistName: artist?.name || FALLBACK_ARTIST_NAME,
        conversationUrl: `${this.config.frontendUrl}/pedido/${this.links.sign(request.id)}`,
      });

      await this.mail.send({ to: request.clientEmail, ...email });
    } catch (error) {
      this.logError(request, error);
    }
  }

  private async notifyArtist(
    request: BookingRequestEntity,
    message: BookingRequestMessageEntity,
    render: (context: ArtistEmailContext) => AppointmentEmail,
  ): Promise<void> {
    try {
      const artist = await this.artists.findContact(request.userId);
      if (!artist) return;

      const email = render({
        request,
        message,
        artistName: artist.name,
        dashboardUrl: `${this.config.frontendUrl}/dashboard/requests/${encodeURIComponent(request.id)}`,
      });

      await this.mail.send({ to: artist.email, ...email });
    } catch (error) {
      this.logError(request, error);
    }
  }

  private logError(request: BookingRequestEntity, error: unknown): void {
    this.logger.error(
      `Falha ao enviar e-mail da conversa ${request.id}: ${(error as Error).message}`,
    );
  }
}
