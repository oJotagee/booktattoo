import { Inject, Injectable } from '@nestjs/common';

import { CATALOG_GATEWAY, type CatalogGateway } from '../../port/catalog-gateway.port';
import { ARTIST_GATEWAY, type ArtistGateway } from '../../port/artist-gateway.port';
import { DepositBookingService } from '../../services/deposit-booking.service';
import { AppointmentEntity } from '@/domain/entities/appointment.entity';
import {
  ArtistUnavailableError,
  GaleryUnavailableError,
  InvalidAppointmentError,
  SlotInThePastError,
  SlotUnavailableError,
} from '@/domain/errors/appointment.error';
import { isValidDate, toScheduledAt } from '@/domain/schedule';

const BOOKABLE_ARTIST_STATUS = 'ACTIVE';

type CreatePublicAppointmentInput = {
  artistId: string;
  galeryId: string;
  date: string;
  time: string;
  name: string;
  email: string;
  phone: string;
};

type CreatePublicAppointmentOutput = {
  appointmentId: string;
  checkoutUrl: string;
};

@Injectable()
export class CreatePublicAppointmentUseCase {
  constructor(
    @Inject(ARTIST_GATEWAY)
    private readonly artists: ArtistGateway,
    @Inject(CATALOG_GATEWAY)
    private readonly catalog: CatalogGateway,
    private readonly booking: DepositBookingService,
  ) {}

  async execute(input: CreatePublicAppointmentInput): Promise<CreatePublicAppointmentOutput> {
    const { artistId, galeryId, date, time } = input;

    if (!isValidDate(date)) throw new InvalidAppointmentError('Data inválida.');

    const [artist, galery] = await Promise.all([
      this.artists.findById(artistId),
      this.catalog.findGaleryById(galeryId),
    ]);

    if (!artist || artist.status !== BOOKABLE_ARTIST_STATUS || !artist.paymentsEnabled) {
      throw new ArtistUnavailableError();
    }
    if (!galery || galery.userId !== artist.id || !galery.available) {
      throw new GaleryUnavailableError();
    }
    if (!artist.times.includes(time)) throw new SlotUnavailableError();

    const scheduledAt = toScheduledAt(date, time);
    if (scheduledAt.getTime() <= Date.now()) throw new SlotInThePastError();

    const appointment = AppointmentEntity.create({
      id: crypto.randomUUID(),
      clientName: input.name,
      clientEmail: input.email,
      clientPhone: input.phone,
      scheduledAt,
      duration: galery.service.duration,
      price: galery.price,
      depositAmount: Math.min(galery.service.depositAmount, galery.price),
      userId: artist.id,
      serviceId: galery.serviceId,
      galeryId: galery.id,
      galeryTitle: galery.title,
      galeryImageUrl: galery.imageUrl,
    });

    const { checkoutUrl } = await this.booking.reserve({
      appointment,
      artistTimes: artist.times,
      date,
      time,
      checkout: { title: galery.title, imageUrl: galery.imageUrl },
    });

    return { appointmentId: appointment.id, checkoutUrl };
  }
}
