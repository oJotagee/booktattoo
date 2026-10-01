import { Inject, Injectable } from '@nestjs/common';

import type { GaleryRepository } from '../../port/galery-repository.port';
import { GALERY_REPOSITORY } from '../../port/galery-repository.port';
import { type GaleryEntity } from '@/domain/entities/galery.entity';
import { GaleryNotFoundError } from '@/domain/errors/galery.error';
import { ForbiddenResourceAccessError } from '@/domain/errors/authorization.error';

type UpdateGaleryAvailabilityInput = {
  galeryId: string;
  available: boolean;
  userId: string;
};

type UpdateGaleryAvailabilityOutput = {
  id: string;
  available: boolean;
  updatedAt: Date;
};

@Injectable()
export class UpdateGaleryAvailabilityUseCase {
  constructor(
    @Inject(GALERY_REPOSITORY)
    private readonly galeries: GaleryRepository,
  ) {}

  async execute({
    galeryId,
    available,
    userId,
  }: UpdateGaleryAvailabilityInput): Promise<UpdateGaleryAvailabilityOutput> {
    const galery = await this.galeries.findById(galeryId);
    if (!galery) throw new GaleryNotFoundError(galeryId);

    if (galery.userId !== userId) throw new ForbiddenResourceAccessError();

    const updatedGalery = this.applyAvailability(galery, available);

    await this.galeries.update(updatedGalery);

    return {
      id: updatedGalery.id,
      available: updatedGalery.available,
      updatedAt: updatedGalery.updatedAt,
    };
  }

  private applyAvailability(galery: GaleryEntity, available: boolean): GaleryEntity {
    if (available) {
      return galery.activate();
    } else {
      return galery.deactivate();
    }
  }
}
