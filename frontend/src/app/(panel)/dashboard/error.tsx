'use client';

import { AlertTriangle } from 'lucide-react';

import { Button } from '@/components/ui/button';

type DashboardErrorProps = {
  reset: () => void;
};

export default function DashboardError({ reset }: DashboardErrorProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
      <AlertTriangle className="size-10 text-orange-600" />
      <h2 className="text-xl font-semibold text-foreground">Não foi possível carregar esta página</h2>
      <p className="max-w-md text-sm text-muted-foreground">
        Ocorreu um erro inesperado ao buscar seus dados. Tente novamente em instantes.
      </p>
      <Button
        onClick={reset}
        className="bg-orange-600 text-white hover:brightness-75 duration-300 cursor-pointer"
      >
        Tentar novamente
      </Button>
    </div>
  );
}
