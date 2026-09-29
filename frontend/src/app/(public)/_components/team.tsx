import { Suspense } from 'react';
import Image from 'next/image';

import { getAllArtists } from '../_data-access/get-all-artists';
import { TeamSkeleton } from './team-skeleton';
import { getInitials } from '@/lib/utils';

const ARTISTS_LIMIT = 4;

export const revalidate = 120;

export function Team() {
  return (
    <section className="relative w-full py-14 px-6 md:px-28 md:py-22 bg-mist-800/20">
      <h2 className="text-orange-600/80 uppercase text-md mb-5 tracking-widest">Equipe</h2>
      <h1 className="text-white text-3xl md:text-4xl font-bold md:w-sm">Nossos artistas</h1>

      <Suspense fallback={<TeamSkeleton items={ARTISTS_LIMIT} />}>
        <TeamList />
      </Suspense>
    </section>
  );
}

async function TeamList() {
  const artists = await getAllArtists({ limit: ARTISTS_LIMIT, offset: 0 });

  if (artists.list.length === 0) {
    return (
      <div className="mt-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
        <div className="col-span-full text-center text-white/60">
          Nenhum artista encontrado, crie uma conta para se tornar artista.
        </div>
      </div>
    )
  };

  return (
    <div className="mt-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
      {artists.list.map((artist) => (
        <div key={artist.id}>
          <div className="relative aspect-square w-full rounded-2xl overflow-hidden">
            {artist.image ? (
              <Image src={artist.image} alt={artist.name} fill className="object-cover" />
            ) : (
              <div className="flex w-full h-full items-center justify-center bg-mist-800 text-white/60 text-4xl font-bold">
                {getInitials(artist.name)}
              </div>
            )}
          </div>
          <div className="flex flex-col items-center p-4">
            <span className="text-white font-medium truncate capitalize">{artist.name}</span>
            <span className="text-white/30 text-sm capitalize">
              {artist.role ? artist.role : 'N/A'}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
