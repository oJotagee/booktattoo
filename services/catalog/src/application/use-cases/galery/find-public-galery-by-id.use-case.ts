import { Inject, Injectable } from '@nestjs/common';

import type { ServiceRepository } from '../../port/service-repository.port';
import type { ArtistRepository } from '../../port/artist-repository.port';
import type { GaleryRepository } from '../../port/galery-repository.port';
import { SERVICE_REPOSITORY } from '../../port/service-repository.port';
import { ARTIST_REPOSITORY } from '../../port/artist-repository.port';
import { GALERY_REPOSITORY } from '../../port/galery-repository.port';
import { GaleryNotFoundError } from '@/domain/errors/galery.error';
import type { GaleryStyle } from '@/domain/entities/galery.entity';
import { ArtistStatus } from '@/domain/entities/artist.entity';

type FindPublicGaleryByIdOutput = {
  id: string;
  title: string;
  imageUrl: string;
  size: string;
  price: number;
  style: GaleryStyle;
  available: boolean;
  userId: string;
  artistName: string | null;
  serviceId: string;
  service: {
    duration: number;
    depositAmount: number;
  };
};

@Injectable()
export class FindPublicGaleryByIdUseCase {
  constructor(
    @Inject(GALERY_REPOSITORY)
    private readonly galeries: GaleryRepository,
    @Inject(SERVICE_REPOSITORY)
    private readonly services: ServiceRepository,
    @Inject(ARTIST_REPOSITORY)
    private readonly artists: ArtistRepository,
  ) {}

  async execute({ id }: { id: string }): Promise<FindPublicGaleryByIdOutput> {
    const galery = await this.galeries.findById(id);
    if (!galery) throw new GaleryNotFoundError(id);

    const [service, artist] = await Promise.all([
      this.services.findById(galery.serviceId),
      this.artists.findById(galery.userId),
    ]);

    if (!service || artist?.status === ArtistStatus.INACTIVE) throw new GaleryNotFoundError(id);

    return {
      id: galery.id,
      title: galery.title,
      imageUrl: galery.imageUrl,
      size: galery.size,
      price: galery.price,
      style: galery.style,
      available: galery.available && service.status,
      userId: galery.userId,
      artistName: artist?.name ?? null,
      serviceId: galery.serviceId,
      service: {
        duration: service.duration,
        depositAmount: service.depositAmount,
      },
    };
  }
}
