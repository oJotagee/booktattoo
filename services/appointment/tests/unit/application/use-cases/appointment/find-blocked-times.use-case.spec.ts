import { beforeEach, describe, expect, it } from 'bun:test';

import { FindBlockedTimesUseCase } from '@/application/use-cases/appointment/find-blocked-times.use-case';
import { InvalidAppointmentError } from '@/domain/errors/appointment.error';
import { buildAppointment } from '@tests/unit/support/builders';
import {
  buildArtistSnapshot,
  createAppointmentRepositoryMock,
  createArtistGatewayMock,
  createCacheMock,
} from '@tests/unit/support/mocks';

const DATE = '2030-01-15';

describe('FindBlockedTimesUseCase', () => {
  let appointments: ReturnType<typeof createAppointmentRepositoryMock>;
  let cache: ReturnType<typeof createCacheMock>;

  beforeEach(() => {
    appointments = createAppointmentRepositoryMock();
    cache = createCacheMock();
    appointments.findInRange = async () => [
      buildAppointment({ scheduledAt: new Date('2030-01-15T12:30:00.000Z'), duration: 60 }),
    ];
  });

  it('blocks every slot covered by the active appointments of the day', async () => {
    const useCase = new FindBlockedTimesUseCase(appointments, createArtistGatewayMock(), cache);

    expect(await useCase.execute({ artistId: 'user-1', date: DATE })).toEqual(['09:30', '10:00']);
  });

  it('caches the appointments per artist and date', async () => {
    const useCase = new FindBlockedTimesUseCase(appointments, createArtistGatewayMock(), cache);

    await useCase.execute({ artistId: 'user-1', date: DATE });

    expect(cache.getOrLoad).toHaveBeenCalledWith(
      'appointment:public:blocked-times:user-1',
      `date=${DATE}`,
      expect.any(Function),
    );
  });

  it('applies the current artist times to the cached appointments', async () => {
    cache.getOrLoad = (async () => [{ time: '09:30', duration: 60 }]) as never;
    const artists = createArtistGatewayMock(
      buildArtistSnapshot({ times: ['09:30', '14:00', '14:30'] }),
    );

    const blocked = await new FindBlockedTimesUseCase(appointments, artists, cache).execute({
      artistId: 'user-1',
      date: DATE,
    });

    expect(blocked).toEqual(['09:30', '14:00']);
  });

  it('returns nothing for an unknown artist without touching the cache', async () => {
    const useCase = new FindBlockedTimesUseCase(appointments, createArtistGatewayMock(null), cache);

    expect(await useCase.execute({ artistId: 'missing', date: DATE })).toEqual([]);
    expect(cache.getOrLoad).not.toHaveBeenCalled();
  });

  it('rejects an invalid date', async () => {
    const useCase = new FindBlockedTimesUseCase(appointments, createArtistGatewayMock(), cache);

    await expect(
      useCase.execute({ artistId: 'user-1', date: '2030-02-30' }),
    ).rejects.toBeInstanceOf(InvalidAppointmentError);
  });
});
