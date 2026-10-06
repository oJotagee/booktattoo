import { TriangleAlert } from 'lucide-react';
import Link from 'next/link';

interface LabelSubscriptionProps {
  expired: boolean;
  limit?: number | null;
  resource?: string;
}

export function LabelSubscription({ expired, limit, resource }: LabelSubscriptionProps) {
  return (
    <div
      role="alert"
      className="mb-4 flex flex-col gap-3 rounded-xl border border-orange-600/40 bg-orange-600/5 px-4 py-3 md:flex-row md:items-center md:justify-between"
    >
      <div className="flex items-center gap-3">
        <TriangleAlert className="mt-0.5 size-5 shrink-0 text-orange-600" />
        <div>
          <h3 className="font-semibold">
            {expired
              ? 'Seu período de teste terminou.'
              : `Você atingiu o limite de ${limit} ${resource} do seu plano.`}
          </h3>
          <p className="text-sm text-white/50">
            {expired
              ? 'Assine um plano para voltar a cadastrar.'
              : 'Faça upgrade para cadastrar mais.'}
          </p>
        </div>
      </div>

      <Link
        href="/dashboard/plans"
        className="w-fit rounded-md bg-orange-600 px-3 py-1.5 text-sm font-semibold text-white hover:brightness-75 duration-300 cursor-pointer"
      >
        Ver planos
      </Link>
    </div>
  );
}
