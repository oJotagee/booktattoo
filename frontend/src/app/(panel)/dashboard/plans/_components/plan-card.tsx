'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { Check } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from 'cn';

import type { SubscriptionPlanInfo } from '@/utils/plans';
import { createCheckout } from '../_actions/create-checkout';
import { changePlan } from '../_actions/change-plan';
import { Button } from '@/components/ui/button';

export type PlanCardAction = 'current' | 'checkout' | 'change';

interface PlanCardProps {
  plan: SubscriptionPlanInfo;
  action: PlanCardAction;
}

const BUTTON_LABEL: Record<PlanCardAction, string> = {
  current: 'Plano atual',
  checkout: 'Ativar assinatura',
  change: 'Mudar para este plano',
};

export function PlanCard({ plan, action }: PlanCardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const isCurrent = action === 'current';

  function handleCheckout() {
    startTransition(async () => {
      const { url, error } = await createCheckout(plan.id);

      if (error || !url) {
        toast.error(error ?? 'Não foi possível iniciar o pagamento. Tente novamente em instantes.');
        return;
      }

      window.location.href = url;
    });
  }

  function handleChangePlan() {
    startTransition(async () => {
      const { error } = await changePlan(plan.id);

      if (error) {
        toast.error(error);
        return;
      }

      router.replace(`${pathname}?sync=${plan.id}`);
    });
  }

  return (
    <article
      aria-label={`Plano ${plan.name}`}
      className={cn(
        'flex flex-col overflow-hidden rounded-2xl border bg-card',
        isCurrent ? 'border-orange-600/70' : 'border-white/10',
      )}
    >
      <header
        className={cn(
          'border-b px-5 py-5',
          isCurrent ? 'border-orange-600/30 bg-orange-600/5' : '',
        )}
      >
        <h3 className="text-lg font-semibold">{plan.name}</h3>
        <p className="text-sm text-white/40">{plan.description}</p>
      </header>

      <div className="flex flex-1 flex-col gap-5 px-5 py-6">
        <div>
          <p className="text-sm text-white/30 line-through">{plan.oldPrice}</p>
          <p className="text-3xl font-bold">
            {plan.price} <span className="text-sm font-normal text-white/40">/mês</span>
          </p>
        </div>

        <ul className="space-y-3">
          {plan.features.map((feature) => (
            <li key={feature} className="flex items-center gap-3 text-sm text-white/80">
              <span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-orange-600/15 text-orange-600">
                <Check className="size-2.5" strokeWidth={4} />
              </span>
              {feature}
            </li>
          ))}
        </ul>

        <Button
          onClick={action === 'checkout' ? handleCheckout : handleChangePlan}
          disabled={isCurrent || isPending}
          className={cn(
            'mt-auto h-11 w-full font-semibold',
            isCurrent
              ? 'bg-white/10 text-white/40'
              : 'bg-orange-600 text-white hover:brightness-75 duration-300 cursor-pointer',
          )}
        >
          {isPending ? 'Aguarde...' : BUTTON_LABEL[action]}
        </Button>
      </div>
    </article>
  );
}
