import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';

export function Footer() {
  return (
    <footer className="container mx-auto bg-black text-white py-20 space-y-6">
      <h2 className="text-center text-4xl md:text-6xl">Pronto para tatuar?</h2>

      <p className="text-center mt-2 text-sm md:text-base text-white/50">
        Escolha seu flash e garanta sua vaga agora mesmo.
      </p>

      <Button
        size={'lg'}
        className="mx-auto flex w-fit flex-row items-center mt-4 bg-orange-600 text-white hover:brightness-75 duration-300 font-semibold h-11 px-6 cursor-pointer"
        render={<Link href="/galery" />}
        nativeButton={false}
      >
        Explorar galeria
        <ArrowRight />
      </Button>

      <nav
        aria-label="Links institucionais"
        className="flex justify-center gap-6 text-sm text-white/50"
      >
        <Link href="/artists" className="hover:text-white duration-300">
          Artistas
        </Link>
        <Link href="/privacidade" className="hover:text-white duration-300">
          Política de privacidade
        </Link>
      </nav>

      <span className="block text-center mt-4 text-white/40 text-sm">
        © {new Date().getFullYear()} Book Tattoo · Todos os direitos reservados
      </span>
    </footer>
  );
}
