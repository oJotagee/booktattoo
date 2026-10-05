import { Suspense } from 'react';

import { GaleryGridSkeleton } from './_components/galery-grid-skeleton';
import { GaleryList } from './_components/galery-list';
import { Footer } from '../_components/footer';
import { Header } from '../_components/header';

export default function GaleryPage() {
  return (
    <div className="flex flex-col min-h-screen bg-black">
      <Header />

      <section className="w-full pt-32 pb-14 px-6 md:px-28 md:pb-22">
        <div className="flex flex-col gap-6 border-b border-white/10 pb-10 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-orange-600/80 uppercase text-md mb-5 tracking-widest">Galeria</h2>
            <h1 className="text-white text-4xl md:text-6xl font-semibold leading-tight">
              Flashes prontos <br />
              <span className="text-orange-600 italic">para a sua pele.</span>
            </h1>
          </div>

          <p className="text-white/50 text-sm md:text-base max-w-md">
            Explore os designs exclusivos dos nossos artistas, filtre pelo estilo que combina com
            você e garanta o seu horário.
          </p>
        </div>

        <Suspense fallback={<GaleryGridSkeleton items={10} />}>
          <GaleryList />
        </Suspense>
      </section>
    </div>
  );
}
