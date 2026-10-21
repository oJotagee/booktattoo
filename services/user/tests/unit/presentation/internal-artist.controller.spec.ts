import { describe, expect, it, mock } from 'bun:test';

import { InternalArtistController } from '@/presentation/controllers/internal-artist.controller';

describe('InternalArtistController', () => {
  it('exposes only the name and email of the artist', async () => {
    const findUserById = {
      execute: mock(async () => ({
        id: 'user-1',
        name: 'Ana Lima',
        email: 'ana@estudio.com',
        phone: '11999999999',
        address: 'Rua Exemplo, 123',
      })),
    };
    const controller = new InternalArtistController(findUserById as never);

    const contact = await controller.contact('user-1');

    expect(findUserById.execute).toHaveBeenCalledWith({ id: 'user-1' });
    expect(contact).toEqual({ name: 'Ana Lima', email: 'ana@estudio.com' });
  });
});
