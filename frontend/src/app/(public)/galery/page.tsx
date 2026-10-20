import type { Metadata } from 'next';
import { Suspense } from 'react';

import { BASE_OPEN_GRAPH, SITE_NAME } from '@/lib/site';
import { GaleryGridSkeleton } from './_components/galery-grid-skeleton';
import { GaleryListLoader } from './_components/galery-list-loader';
import { Footer } from '../_components/footer';
import { Header } from '../_components/header';

const title = 'Galeria de flash tattoos';

const description =
  'Veja os flash tattoos disponíveis para agendamento, com estilo, tamanho e preço de cada design. Escolha o seu e reserve o horário online.';

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: '/galery' },
  openGraph: { ...BASE_OPEN_GRAPH, url: '/galery', title: `${title} | ${SITE_NAME}`, description },
};

export default function GaleryPage({ searchParams }: PageProps<'/galery'>) {
  return (
    <div className="flex flex-col min-h-screen bg-black">
      <Header />

      <main className="w-full pt-32 pb-14 px-6 md:px-28 md:pb-22">
        <div className="flex flex-col gap-6 border-b border-white/10 pb-10 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-orange-600/80 uppercase text-md mb-5 tracking-widest">Galeria</p>
            <h1 className="text-white text-4xl md:text-6xl font-semibold leading-tight">
              Flashes prontos <br />
              <span className="text-orange-600 italic">para a sua pele.</span>
            </h1>
          </div>

          <p className="text-white/50 text-sm md:text-base max-w-md">
            Cada flash é um design exclusivo de um tatuador cadastrado. Filtre pelo estilo, veja o
            preço e reserve o horário direto com quem vai tatuar.
          </p>
        </div>

        <Suspense fallback={<GaleryGridSkeleton items={10} />}>
          <GaleryListLoader searchParams={searchParams} />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}
