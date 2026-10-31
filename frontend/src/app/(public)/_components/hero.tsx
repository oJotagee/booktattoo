import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import HeroImg from '../../../../public/hero.webp';
import { Button } from '@/components/ui/button';

export function Hero() {
  return (
    <section className="relative w-full h-screen">
      <div className="absolute inset-0">
        <Image
          src={HeroImg}
          alt="Tatuador fazendo uma tatuagem no antebraço de um cliente"
          quality={75}
          priority={true}
          placeholder="blur"
          fill
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/80" />
      </div>

      <div className="container relative flex flex-col items-start justify-center h-full max-w-2xl py-4 px-6 md:px-28">
        <h1 className="text-orange-600 text-sm font-semibold tracking-widest uppercase">
          Agendamento de tatuagem e flash tattoo online
        </h1>

        <p className="mt-4 text-5xl md:text-7xl font-semibold text-white leading-tight">
          Arte na pele, <span className="text-orange-600 italic">pronta</span> para você.
        </p>

        <p className="mt-6 text-base text-white/50 max-w-lg">
          Agende sua tatuagem online: escolha um design flash exclusivo de um tatuador independente,
          reserve data e horário e pague só o sinal para garantir a vaga.
        </p>

        <div className="mt-8 flex items-center gap-3 flex-wrap">
          <Button
            size="lg"
            className="bg-orange-600 text-white hover:brightness-75 duration-300 h-11 px-6 font-semibold cursor-pointer"
            render={<Link href="/galery" />}
            nativeButton={false}
          >
            Ver Galeria
            <ArrowRight />
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="h-11 px-6 border-white/30 bg-transparent text-white hover:bg-white/10 cursor-pointer"
            render={<Link href="#how-it-works" />}
            nativeButton={false}
          >
            Como Funciona
          </Button>
        </div>
      </div>
    </section>
  );
}
