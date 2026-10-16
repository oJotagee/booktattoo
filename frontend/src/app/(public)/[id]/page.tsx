import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { Suspense } from 'react';
import Image from 'next/image';

import { GaleryGridSkeleton } from '../galery/_components/galery-grid-skeleton';
import { BookingReturnToast } from '../_components/booking/booking-return-toast';
import { getPublicArtist } from '../_data-access/get-public-artist';
import { GaleryList } from '../galery/_components/galery-list';
import { getInitials } from '@/lib/utils';

interface ArtistPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: ArtistPageProps): Promise<Metadata> {
  const { id } = await params;
  const artist = await getPublicArtist(id);

  return { title: artist ? `${artist.name} | Flashes` : 'Tatuador não encontrado' };
}

export default async function ArtistPage({ params }: ArtistPageProps) {
  const { id } = await params;
  const artist = await getPublicArtist(id);

  if (!artist) notFound();

  const [firstName, ...lastNames] = artist.name.split(' ');

  return (
    <div className="flex flex-col min-h-screen bg-black">
      <section className="w-full pt-14 pb-14 px-6 md:px-28 md:pt-20 md:pb-22">
        <div className="flex flex-col gap-6 border-b border-white/10 pb-10 md:flex-row md:items-end md:justify-between">
          <div className="flex items-end gap-6">
            <div className="relative hidden size-28 shrink-0 overflow-hidden rounded-2xl bg-mist-800 sm:block">
              {artist.image ? (
                <Image
                  src={artist.image}
                  alt={artist.name}
                  fill
                  sizes="112px"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-3xl font-bold text-white/60">
                  {getInitials(artist.name)}
                </div>
              )}
            </div>

            <div>
              <h2 className="text-orange-600/80 uppercase text-md mb-5 tracking-widest">
                {artist.role ?? 'Tatuador'}
              </h2>
              <h1 className="text-white text-4xl md:text-6xl font-semibold leading-tight capitalize">
                {firstName}{' '}
                {lastNames.length > 0 && (
                  <span className="text-orange-600 italic">{lastNames.join(' ')}</span>
                )}
              </h1>
            </div>
          </div>

          <p className="text-white/50 text-sm md:text-base max-w-md">
            {artist.bio ??
              'Escolha um dos flashes disponíveis, reserve o seu horário e pague o sinal para garantir a sua sessão.'}
          </p>
        </div>

        {artist.status === 'VACATION' && (
          <p className="mt-6 rounded-xl border border-orange-600/30 bg-orange-600/5 px-4 py-3 text-sm text-white/70">
            {artist.name} está de férias e não está recebendo novos agendamentos no momento.
          </p>
        )}

        <Suspense fallback={<GaleryGridSkeleton items={10} />}>
          <GaleryList artistId={artist.id} />
          <BookingReturnToast />
        </Suspense>
      </section>
    </div>
  );
}
