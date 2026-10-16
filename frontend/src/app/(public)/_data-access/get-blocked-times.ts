'use server';

import { api } from '@/lib/api';

interface GetBlockedTimesProps {
  artistId: string;
  date: string;
}

export async function getBlockedTimes({ artistId, date }: GetBlockedTimesProps): Promise<string[]> {
  try {
    const response = await api.get<{ blockedTimes: string[] }>(
      '/public/appointments/blocked-times',
      {
        params: { artistId, date },
      },
    );

    return response.data.blockedTimes;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : String(error));
  }
}
