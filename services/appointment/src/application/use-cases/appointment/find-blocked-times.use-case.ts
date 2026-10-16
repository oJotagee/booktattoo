import { Inject, Injectable } from '@nestjs/common';

import { buildBlockedTimes, dayRange, isValidDate, toSlotTime } from '@/domain/schedule';
import type { AppointmentRepository } from '../../port/appointment-repository.port';
import { ARTIST_GATEWAY, type ArtistGateway } from '../../port/artist-gateway.port';
import { ACTIVE_APPOINTMENT_STATUSES } from '@/domain/entities/appointment.entity';
import { APPOINTMENT_REPOSITORY } from '../../port/appointment-repository.port';
import { InvalidAppointmentError } from '@/domain/errors/appointment.error';

type FindBlockedTimesInput = {
  artistId: string;
  date: string;
};

@Injectable()
export class FindBlockedTimesUseCase {
  constructor(
    @Inject(APPOINTMENT_REPOSITORY)
    private readonly appointments: AppointmentRepository,
    @Inject(ARTIST_GATEWAY)
    private readonly artists: ArtistGateway,
  ) {}

  async execute({ artistId, date }: FindBlockedTimesInput): Promise<string[]> {
    if (!isValidDate(date)) throw new InvalidAppointmentError('Data inválida.');

    const artist = await this.artists.findById(artistId);
    if (!artist) return [];

    const appointments = await this.appointments.findInRange({
      userId: artistId,
      ...dayRange(date),
      statuses: ACTIVE_APPOINTMENT_STATUSES,
    });

    return buildBlockedTimes(
      appointments.map((appointment) => ({
        time: toSlotTime(appointment.scheduledAt, date),
        duration: appointment.duration,
      })),
      artist.times,
    );
  }
}
