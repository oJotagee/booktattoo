import { Lottie } from 'lottie-react';
import Link from 'next/link';

import animationData from '../../public/animation/ERROR-404.json';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background px-4">
      <div className="w-full max-w-md">
        <Lottie src={animationData} loop autoplay />
      </div>
      <h1 className="text-2xl font-semibold text-foreground mt-4 mb-2">Página não encontrada</h1>
      <p className="text-muted-foreground text-center mb-8">
        A página que você está procurando não existe ou foi movida.
      </p>
      <Link
        href="/"
        className="px-6 py-3 rounded-lg bg-orange-600 text-white font-medium hover:opacity-90 transition-opacity"
      >
        Voltar para a Home
      </Link>
    </div>
  );
}
