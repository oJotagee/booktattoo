import { ArrowRight } from 'lucide-react';

import { Button } from '@/components/ui/button';

export function Footer() {
  return (
    <footer className="container mx-auto bg-black text-white py-20 space-y-6">
      <h1 className="text-center font-serif text-4xl md:text-6xl">Pronto para tatuar?</h1>

      <p className="text-center mt-2 text-sm md:text-base text-white/50">
        Escolha seu flash e garanta sua vaga agora mesmo.
      </p>

      <Button
        size={'lg'}
        className="mx-auto flex flex-row items-center mt-4 bg-orange-600 text-white hover:brightness-75 duration-300 font-semibold h-11 px-6 cursor-pointer"
      >
        Explorar galeria
        <ArrowRight />
      </Button>

      <span className="block text-center mt-4 text-white/20 text-sm">
        © {new Date().getFullYear()} BookInk · Todos os direitos reservados
      </span>
    </footer>
  );
}
