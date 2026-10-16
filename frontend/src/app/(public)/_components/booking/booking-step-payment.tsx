import { useMutation } from '@tanstack/react-query';
import { Loader2, Lock } from 'lucide-react';
import { toast } from 'sonner';

import { createBooking } from '../../_actions/create-booking';
import { formatCurrency } from '@/utils/formatService';
import type { BookingSchemaData } from './schemas';
import { formatDateParam } from '@/lib/schedule';
import { Button } from '@/components/ui/button';

interface BookingStepPaymentProps {
  values: BookingSchemaData;
  artistId: string;
  galeryId: string;
  price: number;
  depositAmount: number;
  onBack: () => void;
}

const SECTION_LABEL_CLASS = 'text-xs font-medium uppercase tracking-widest text-white/50';

export function BookingStepPayment({
  values,
  artistId,
  galeryId,
  price,
  depositAmount,
  onBack,
}: BookingStepPaymentProps) {
  // Mesmo teto aplicado no backend: o sinal nunca passa do valor do flash
  const deposit = Math.min(depositAmount, price);

  const {
    mutateAsync: createBookingMutation,
    isPending,
    isSuccess,
  } = useMutation({
    mutationFn: createBooking,
  });

  async function handlePay() {
    const response = await createBookingMutation({ ...values, artistId, galeryId });

    if (response.error || !response.data) {
      toast.error(response.error ?? 'Não foi possível concluir o agendamento');
      return;
    }

    window.location.assign(response.data.checkoutUrl);
  }

  const isRedirecting = isPending || isSuccess;

  return (
    <div className="flex flex-col gap-6 px-6 py-5">
      <div className="flex items-start justify-between gap-4 rounded-xl border border-orange-600/30 bg-orange-600/5 p-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-widest text-orange-500">
            Sinal (reserva)
          </span>
          <p className="mt-1 text-xs text-white/60">
            Restante {formatCurrency(price - deposit)} pago no estúdio.
          </p>
        </div>
        <p className="font-serif text-2xl text-white">{formatCurrency(deposit)}</p>
      </div>

      <dl className="flex gap-10 border-b pb-5">
        <div>
          <dt className={SECTION_LABEL_CLASS}>Data</dt>
          <dd className="mt-1 font-medium text-white">{formatDateParam(values.date)}</dd>
        </div>
        <div>
          <dt className={SECTION_LABEL_CLASS}>Horário</dt>
          <dd className="mt-1 font-medium text-white">{values.time}</dd>
        </div>
      </dl>

      <div className="flex flex-col gap-3">
        <span className={SECTION_LABEL_CLASS}>Cartão de crédito</span>
        <p className="text-sm text-white/60">
          Você será levado ao checkout seguro do Stripe para pagar o sinal. Seu horário fica
          reservado por 30 minutos enquanto o pagamento não é concluído.
        </p>
        <p className="flex items-center gap-2 text-xs text-white/40">
          <Lock className="size-3.5" />
          Pagamento seguro — seus dados são criptografados
        </p>
      </div>

      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          size="lg"
          className="h-11 cursor-pointer"
          disabled={isRedirecting}
          onClick={onBack}
        >
          Voltar
        </Button>
        <Button
          type="button"
          size="lg"
          className="h-11 flex-1 cursor-pointer bg-orange-600 font-semibold text-white duration-300 hover:brightness-75"
          disabled={isRedirecting}
          onClick={handlePay}
        >
          {isRedirecting && <Loader2 className="size-4 animate-spin" />}
          Pagar sinal {formatCurrency(deposit)}
        </Button>
      </div>
    </div>
  );
}
