import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import HeroImg from '../../../../public/hero.jpg';

export function Hero() {
  return (
    <section className="relative w-full h-screen">
      <div className="absolute inset-0">
        <Image
          src={HeroImg.src}
          alt="Hero"
          quality={75}
          priority={true}
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/80" />
      </div>

      <div className="container relative flex flex-col items-start justify-center h-full max-w-2xl py-4 px-6 md:px-28">
        <p className="text-orange-600 text-sm font-semibold tracking-widest uppercase">
          Flash Tattoo Studio
        </p>

        <h1 className="mt-4 text-5xl md:text-7xl font-semibold text-white leading-tight">
          Arte na pele, <span className="text-orange-600 italic">pronta</span> para você.
        </h1>

        <p className="mt-6 text-base text-white/50 max-w-lg">
          Escolha entre dezenas de designs flash exclusivos criados pelos nossos artistas. Reserve
          online, pague o sinal e venha tatuar.
        </p>

        <div className="mt-8 flex items-center gap-3 flex-wrap">
          <Button
            size="lg"
            className="bg-orange-600 text-white hover:brightness-75 duration-300 h-11 px-6 font-semibold cursor-pointer"
          >
            Ver flashs disponíveis
            <ArrowRight />
          </Button>
          <Link href={'#how-it-works'}>
            <Button
              variant="outline"
              size="lg"
              className="h-11 px-6 border-white/30 bg-transparent text-white hover:bg-white/10 cursor-pointer"
            >
              Como funciona
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
