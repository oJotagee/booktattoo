import { MAIL_PORT, type MailPort } from '@bookink/shared/mail';
import type { ConfigType } from '@nestjs/config';
import { Inject, Injectable, Logger } from '@nestjs/common';

import type { AppointmentNotifier } from '@/application/port/appointment-notifier.port';
import { ARTIST_GATEWAY, type ArtistGateway } from '@/application/port/artist-gateway.port';
import type { AppointmentEntity } from '@/domain/entities/appointment.entity';
import servicesConfig from '../config/services.config';
import {
  type AppointmentEmail,
  type AppointmentEmailContext,
  cancelledWithRefundEmail,
  confirmedEmail,
  latePaymentRefundedEmail,
} from './appointment-emails';

const FALLBACK_ARTIST_NAME = 'O tatuador';

@Injectable()
export class MailAppointmentNotifier implements AppointmentNotifier {
  private readonly logger = new Logger(MailAppointmentNotifier.name);

  constructor(
    @Inject(MAIL_PORT)
    private readonly mail: MailPort,
    @Inject(ARTIST_GATEWAY)
    private readonly artists: ArtistGateway,
    @Inject(servicesConfig.KEY)
    private readonly config: ConfigType<typeof servicesConfig>,
  ) {}

  confirmed(appointment: AppointmentEntity): Promise<void> {
    return this.notify(appointment, confirmedEmail);
  }

  cancelledWithRefund(appointment: AppointmentEntity): Promise<void> {
    return this.notify(appointment, cancelledWithRefundEmail);
  }

  latePaymentRefunded(appointment: AppointmentEntity): Promise<void> {
    return this.notify(appointment, latePaymentRefundedEmail);
  }

  private async notify(
    appointment: AppointmentEntity,
    render: (context: AppointmentEmailContext) => AppointmentEmail,
  ): Promise<void> {
    try {
      const email = render({
        appointment,
        artistName: await this.artistName(appointment.userId),
        artistUrl: `${this.config.frontendUrl}/${encodeURIComponent(appointment.userId)}`,
      });

      await this.mail.send({ to: appointment.clientEmail, ...email });
    } catch (error) {
      this.logger.error(
        `Falha ao enviar e-mail do agendamento ${appointment.id}: ${(error as Error).message}`,
      );
    }
  }

  private async artistName(artistId: string): Promise<string> {
    const artist = await this.artists.findById(artistId).catch(() => null);

    return artist?.name || FALLBACK_ARTIST_NAME;
  }
}
