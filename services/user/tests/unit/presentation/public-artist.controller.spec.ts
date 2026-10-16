import { describe, expect, it, mock } from 'bun:test';

import { PublicArtistController } from '@/presentation/controllers/public-artist.controller';

describe('PublicArtistController', () => {
  it('delegates listing artists to FindPublicArtistsUseCase with the pagination filter', async () => {
    const findPublicArtists = { execute: mock(async () => ({ list: [], pagination: {} })) };
    const controller = new PublicArtistController(findPublicArtists as never, {} as never);

    await controller.findAll({ limit: 20, offset: 40 });

    expect(findPublicArtists.execute).toHaveBeenCalledWith({ limit: 20, offset: 40 });
  });

  it('delegates finding one artist to FindPublicArtistByIdUseCase', async () => {
    const findPublicArtistById = { execute: mock(async () => ({ id: 'user-1' })) };
    const controller = new PublicArtistController({} as never, findPublicArtistById as never);

    await controller.findById('user-1');

    expect(findPublicArtistById.execute).toHaveBeenCalledWith({ id: 'user-1' });
  });
});
