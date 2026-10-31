import type { Metadata } from 'next';
import { Suspense } from 'react';

import { ArtistGridSkeleton } from './_components/artist-grid-skeleton';
import { ArtistListLoader } from './_components/artist-list-loader';
import { BASE_OPEN_GRAPH, SITE_NAME } from '@/lib/site';
import { Header } from '../_components/header';

const title = 'Tatuadores e estúdios de tatuagem';

const description =
  'Encontre tatuadores independentes, conheça seus estilos e estúdios e agende sua tatuagem online pelo BookTattoo.';

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: '/artists' },
  openGraph: { ...BASE_OPEN_GRAPH, url: '/artists', title: `${title} | ${SITE_NAME}`, description },
};

export default function ArtistsPage({ searchParams }: PageProps<'/artists'>) {
  return (
    <div className="flex flex-col min-h-screen bg-black">
      <Header />

      <main className="w-full pt-32 pb-14 px-6 md:px-28 md:pb-22">
        <div className="flex flex-col gap-6 border-b border-white/10 pb-10 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-orange-600/80 uppercase text-md mb-5 tracking-widest">
              Quem faz acontecer
            </p>
            <h1 className="text-white text-4xl md:text-6xl font-semibold leading-tight">
              Artistas com <br />
              <span className="text-orange-600 italic">assinatura própria.</span>
            </h1>
          </div>

          <p className="text-white/50 text-sm md:text-base max-w-md">
            Tatuadores independentes que publicam flashes e recebem agendamentos pelo BookTattoo.
            Veja o estilo de cada um e escolha com quem você quer tatuar.
          </p>
        </div>

        <Suspense fallback={<ArtistGridSkeleton items={12} />}>
          <ArtistListLoader searchParams={searchParams} />
        </Suspense>
      </main>
    </div>
  );
}
