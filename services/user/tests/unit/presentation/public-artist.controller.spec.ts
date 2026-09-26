import { describe, expect, it, mock } from 'bun:test';

import { PublicArtistController } from '@/presentation/controllers/public-artist.controller';

describe('PublicArtistController', () => {
  it('delegates listing artists to FindPublicArtistsUseCase with the pagination filter', async () => {
    const findPublicArtists = { execute: mock(async () => ({ list: [], pagination: {} })) };
    const controller = new PublicArtistController(findPublicArtists as never);

    await controller.findAll({ limit: 20, offset: 40 });

    expect(findPublicArtists.execute).toHaveBeenCalledWith({ limit: 20, offset: 40 });
  });
});
