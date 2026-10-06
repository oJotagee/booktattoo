import { Suspense } from 'react';

import { ArtistGridSkeleton } from './_components/artist-grid-skeleton';
import { ArtistList } from './_components/artist-list';
import { Header } from '../_components/header';

export default function ArtistsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-black">
      <Header />

      <section className="w-full pt-32 pb-14 px-6 md:px-28 md:pb-22">
        <div className="flex flex-col gap-6 border-b border-white/10 pb-10 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-orange-600/80 uppercase text-md mb-5 tracking-widest">
              Quem faz acontecer
            </h2>
            <h1 className="text-white text-4xl md:text-6xl font-semibold leading-tight">
              Artistas com <br />
              <span className="text-orange-600 italic">assinatura própria.</span>
            </h1>
          </div>

          <p className="text-white/50 text-sm md:text-base max-w-md">
            Conheça os profissionais do estúdio, seus estilos e trabalhos disponíveis. Escolha com
            quem você quer transformar sua ideia em pele.
          </p>
        </div>

        <Suspense fallback={<ArtistGridSkeleton items={12} />}>
          <ArtistList />
        </Suspense>
      </section>
    </div>
  );
}
