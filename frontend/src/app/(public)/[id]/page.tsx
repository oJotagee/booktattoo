import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { Suspense } from 'react';
import Image from 'next/image';

import { GaleryGridSkeleton } from '../galery/_components/galery-grid-skeleton';
import { BookingRequestSection } from '../_components/booking-request/booking-request-section';
import { BookingReturnToast } from '../_components/booking/booking-return-toast';
import { GaleryListLoader } from '../galery/_components/galery-list-loader';
import { getPublicArtist } from '../_data-access/get-public-artist';
import { JsonLd } from '@/components/json-ld';
import { Header } from '../_components/header';
import { getInitials } from '@/lib/utils';
import { BASE_OPEN_GRAPH, SITE_NAME, SITE_URL } from '@/lib/site';

interface ArtistPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

const DEFAULT_BIO =
  'Escolha um dos flashes disponíveis, reserve o seu horário e pague o sinal para garantir a sua sessão.';

export async function generateMetadata({ params }: ArtistPageProps): Promise<Metadata> {
  const { id } = await params;
  const artist = await getPublicArtist(id);

  if (!artist) {
    return { title: 'Tatuador não encontrado', robots: { index: false } };
  }

  const title = `${artist.name} — flashes disponíveis`;
  const description =
    artist.bio ?? `Veja os flashes de ${artist.name} e agende online. ${DEFAULT_BIO}`;

  return {
    title,
    description,
    alternates: { canonical: `/${artist.id}` },
    openGraph: {
      ...BASE_OPEN_GRAPH,
      type: 'profile',
      url: `/${artist.id}`,
      title: `${title} | ${SITE_NAME}`,
      description,
      ...(artist.image && { images: [{ url: artist.image, alt: `Foto de ${artist.name}` }] }),
    },
  };
}

export default async function ArtistPage({ params, searchParams }: ArtistPageProps) {
  const { id } = await params;
  const artist = await getPublicArtist(id);

  if (!artist) notFound();

  const [firstName, ...lastNames] = artist.name.split(' ');

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: artist.name,
    url: `${SITE_URL}/${artist.id}`,
    jobTitle: artist.role ?? 'Tatuador',
    description: artist.bio ?? undefined,
    image: artist.image ?? undefined,
    ...(artist.address && {
      workLocation: { '@type': 'Place', address: artist.address },
    }),
  };

  return (
    <div className="flex flex-col min-h-screen bg-black">
      <JsonLd data={structuredData} />

      <Header />

      <main className="w-full pt-32 pb-14 px-6 md:px-28 md:pb-22">
        <div className="flex flex-col gap-6 border-b border-white/10 pb-10 md:flex-row md:items-end md:justify-between">
          <div className="flex items-end gap-6">
            <div className="relative hidden size-28 shrink-0 overflow-hidden rounded-2xl bg-mist-800 sm:block">
              {artist.image ? (
                <Image
                  src={artist.image}
                  alt={`Foto de ${artist.name}`}
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
              <p className="text-orange-600/80 uppercase text-md mb-5 tracking-widest">
                {artist.role ?? 'Tatuador'}
              </p>
              <h1 className="text-white text-4xl md:text-6xl font-semibold leading-tight capitalize">
                {firstName}{' '}
                {lastNames.length > 0 && (
                  <span className="text-orange-600 italic">{lastNames.join(' ')}</span>
                )}
              </h1>
            </div>
          </div>

          <p className="text-white/50 text-sm md:text-base max-w-md">{artist.bio ?? DEFAULT_BIO}</p>
        </div>

        {artist.status === 'VACATION' && (
          <p className="mt-6 rounded-xl border border-orange-600/30 bg-orange-600/5 px-4 py-3 text-sm text-white/70">
            {artist.name} está de férias e não está recebendo novos agendamentos no momento.
          </p>
        )}

        {artist.status === 'ACTIVE' && !artist.paymentsEnabled && (
          <p className="mt-6 rounded-xl border border-orange-600/30 bg-orange-600/5 px-4 py-3 text-sm text-white/70">
            {artist.name} ainda não está aceitando agendamentos online.
          </p>
        )}

        <Suspense fallback={<GaleryGridSkeleton items={10} />}>
          <GaleryListLoader artistId={artist.id} searchParams={searchParams} />
          <BookingReturnToast />
        </Suspense>

        {artist.status === 'ACTIVE' && (
          <BookingRequestSection artistId={artist.id} artistName={artist.name} />
        )}

        {artist.address && (
          <section aria-labelledby="studio-location" className="mt-14">
            <h2 id="studio-location" className="text-white text-lg font-semibold mb-4">
              Onde fica o estúdio
            </h2>
            <iframe
              title={`Mapa do estúdio de ${artist.name}: ${artist.address}`}
              src={`https://maps.google.com/maps?q=${encodeURIComponent(artist.address)}&z=15&output=embed`}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="h-72 w-full rounded-xl border border-white/10 md:h-80"
            />
          </section>
        )}
      </main>
    </div>
  );
}
