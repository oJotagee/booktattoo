import { Wallet } from 'lucide-react';
import Link from 'next/link';

import { getCurrentUser } from '../_data-access/get-current-user';

export async function PaymentsSetupBanner() {
  const user = await getCurrentUser().catch(() => null);

  if (!user || user.paymentsEnabled) return null;

  return (
    <div className="mb-4 flex flex-col gap-3 rounded-xl border border-orange-600/40 bg-orange-600/5 px-4 py-3 md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-3">
        <Wallet className="size-5 shrink-0 text-orange-600" />
        <p className="text-sm">
          Conecte sua conta Stripe para receber o sinal e liberar os agendamentos no seu perfil.
        </p>
      </div>

      <Link
        href="/dashboard/payments"
        className="w-fit rounded-md bg-orange-600 px-3 py-1.5 text-sm font-semibold text-white hover:brightness-75 duration-300 cursor-pointer"
      >
        Conectar conta
      </Link>
    </div>
  );
}
