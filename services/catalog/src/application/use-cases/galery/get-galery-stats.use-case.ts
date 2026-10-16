import { Inject, Injectable } from '@nestjs/common';

import type { GaleryRepository } from '../../port/galery-repository.port';
import { GALERY_REPOSITORY } from '../../port/galery-repository.port';

type GetGaleryStatsOutput = {
  total: number;
  available: number;
};

@Injectable()
export class GetGaleryStatsUseCase {
  constructor(
    @Inject(GALERY_REPOSITORY)
    private readonly galeries: GaleryRepository,
  ) {}

  async execute({ userId }: { userId: string }): Promise<GetGaleryStatsOutput> {
    const [total, available] = await Promise.all([
      this.galeries.countByUserId(userId),
      this.galeries.countAvailableByUserId(userId),
    ]);

    return { total, available };
  }
}
