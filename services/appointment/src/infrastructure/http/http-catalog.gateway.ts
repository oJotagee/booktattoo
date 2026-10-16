import type { ConfigType } from '@nestjs/config';
import { Inject, Injectable, Logger } from '@nestjs/common';

import type { CatalogGateway, GalerySnapshot } from '@/application/port/catalog-gateway.port';
import servicesConfig from '../config/services.config';
import { requestJson } from './request-json';

@Injectable()
export class HttpCatalogGateway implements CatalogGateway {
  private readonly logger = new Logger(HttpCatalogGateway.name);

  constructor(
    @Inject(servicesConfig.KEY)
    private readonly config: ConfigType<typeof servicesConfig>,
  ) {}

  async findGaleryById(id: string): Promise<GalerySnapshot | null> {
    const url = `${this.config.catalogServiceUrl}/public/galeries/${encodeURIComponent(id)}`;
    const galery = await requestJson<GalerySnapshot>(this.logger, { method: 'GET', url });
    if (!galery) return null;

    return {
      id: galery.id,
      title: galery.title,
      imageUrl: galery.imageUrl,
      price: galery.price,
      available: galery.available,
      userId: galery.userId,
      serviceId: galery.serviceId,
      service: {
        duration: galery.service.duration,
        depositAmount: galery.service.depositAmount,
      },
    };
  }
}
