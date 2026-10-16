import type { ConfigType } from '@nestjs/config';
import { Inject, Injectable, Logger } from '@nestjs/common';

import type { ArtistGateway, ArtistSnapshot } from '@/application/port/artist-gateway.port';
import servicesConfig from '../config/services.config';
import { requestJson } from './request-json';

@Injectable()
export class HttpArtistGateway implements ArtistGateway {
  private readonly logger = new Logger(HttpArtistGateway.name);

  constructor(
    @Inject(servicesConfig.KEY)
    private readonly config: ConfigType<typeof servicesConfig>,
  ) {}

  async findById(id: string): Promise<ArtistSnapshot | null> {
    const url = `${this.config.userServiceUrl}/public/artists/${encodeURIComponent(id)}`;
    const artist = await requestJson<ArtistSnapshot>(this.logger, { method: 'GET', url });
    if (!artist) return null;

    return { id: artist.id, name: artist.name, status: artist.status, times: artist.times };
  }
}
