import { Suspense, type ReactNode } from 'react';
import { connection } from 'next/server';
import Image from 'next/image';
import Link from 'next/link';

import { getAllArtists } from '../_data-access/get-all-artists';
import { TeamSkeleton } from './team-skeleton';
import { getInitials } from '@/lib/utils';

const ARTISTS_LIMIT = 4;

function TeamSection({ children }: { children: ReactNode }) {
  return (
    <section className="relative w-full py-14 px-6 md:px-28 md:py-22 bg-mist-800/20">
      <p className="text-orange-600/80 uppercase text-md mb-5 tracking-widest">Tatuadores</p>
      <h2 className="text-white text-3xl md:text-4xl font-bold md:w-sm">
        Quem agenda pelo BookTattoo
      </h2>

      {children}
    </section>
  );
}

export function Team() {
  return (
    <Suspense
      fallback={
        <TeamSection>
          <TeamSkeleton items={ARTISTS_LIMIT} />
        </TeamSection>
      }
    >
      <TeamList />
    </Suspense>
  );
}

async function TeamList() {
  await connection();

  const artists = await getAllArtists({
    limit: ARTISTS_LIMIT,
    offset: 0,
  }).catch(() => null);

  if (!artists) {
    return (
      <TeamSection>
        <p className="mt-10 text-center text-white/60">
          Não foi possível carregar os artistas, tente novamente mais tarde.
        </p>
      </TeamSection>
    );
  }

  if (artists.list.length === 0) return null;

  return (
    <TeamSection>
      <div className="mt-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
        {artists.list.map((artist) => (
          <Link
            key={artist.id}
            href={`/${artist.id}`}
            className="group block"
            aria-label={`Ver flashes de ${artist.name}`}
          >
            <div className="relative aspect-square w-full rounded-2xl overflow-hidden">
              {artist.image ? (
                <Image
                  src={artist.image}
                  alt={`Foto de ${artist.name}`}
                  fill
                  sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                  className="object-cover"
                />
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
          </Link>
        ))}
      </div>
    </TeamSection>
  );
}
