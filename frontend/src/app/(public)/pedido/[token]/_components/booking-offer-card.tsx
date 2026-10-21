'use client';

import { CalendarCheck, CalendarClock, CalendarX, Loader2 } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'sonner';

import type { BookingOffer } from '@/components/conversation/types';
import { formatOfferDate } from '@/components/conversation/format-offer-date';
import { formatCurrency, formatDuration } from '@/utils/formatService';
import { payBookingOffer } from '../../../_actions/pay-booking-offer';
import { Button } from '@/components/ui/button';

interface BookingOfferCardProps {
  token: string;
  offer: BookingOffer;
  onPaymentFailed: () => Promise<void> | void;
}

export function BookingOfferCard({ token, offer, onPaymentFailed }: BookingOfferCardProps) {
  const [redirecting, setRedirecting] = useState(false);

  const { mutateAsync: payMutation, isPending } = useMutation({
    mutationFn: payBookingOffer,
  });

  const paid = offer.status === 'PAID';
  const cancelled = offer.status === 'CANCELLED';
  const remaining = Math.max(offer.price - offer.depositAmount, 0);
  const loading = isPending || redirecting;

  async function handlePay() {
    const response = await payMutation(token);

    if (response.error || !response.data) {
      toast.error(response.error ?? 'Não foi possível iniciar o pagamento');
      await onPaymentFailed();
      return;
    }

    setRedirecting(true);
    window.location.assign(response.data.checkoutUrl);
  }

  return (
    <section
      aria-label="Proposta de agendamento"
      className="flex flex-col gap-5 rounded-2xl border border-orange-600/30 bg-orange-600/5 p-5"
    >
      <div className="flex items-start gap-3">
        {paid ? (
          <CalendarCheck className="mt-0.5 size-5 shrink-0 text-emerald-500" />
        ) : cancelled ? (
          <CalendarX className="mt-0.5 size-5 shrink-0 text-white/50" />
        ) : (
          <CalendarClock className="mt-0.5 size-5 shrink-0 text-orange-600" />
        )}
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-widest text-white/50">
            {paid
              ? 'Agendamento confirmado'
              : cancelled
                ? 'Agendamento cancelado'
                : 'Proposta de agendamento'}
          </p>
          <h2 className="text-lg font-semibold text-white">{offer.title}</h2>
        </div>
      </div>

      <dl className="grid gap-4 text-sm sm:grid-cols-2">
        <OfferDetail label="Data e horário" value={formatOfferDate(offer.scheduledAt)} />
        <OfferDetail label="Duração" value={formatDuration(offer.duration)} />
        <OfferDetail label="Valor total" value={formatCurrency(offer.price)} />
        <OfferDetail
          label={paid ? 'Sinal pago' : 'Sinal'}
          value={formatCurrency(offer.depositAmount)}
        />
        {!cancelled && (
          <OfferDetail label="Restante no estúdio" value={formatCurrency(remaining)} />
        )}
      </dl>

      {paid ? (
        <p className="text-sm text-white/70">
          Seu horário está reservado. O restante de {formatCurrency(remaining)} é pago direto no
          estúdio.
        </p>
      ) : cancelled ? (
        <p className="text-sm text-white/70">
          O tatuador cancelou este agendamento e o sinal pago foi reembolsado. Você pode combinar
          uma nova data por aqui.
        </p>
      ) : offer.expired ? (
        <p className="text-sm text-white/70">
          O horário desta proposta já passou. Peça ao tatuador uma nova data por aqui.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {offer.paymentInProgress && !loading && (
            <p className="text-sm text-white/60">
              Há um pagamento em andamento para esta proposta. Se você fechou a página de pagamento,
              aguarde até 30 minutos para tentar de novo.
            </p>
          )}
          <Button
            size="lg"
            className="h-11 w-full cursor-pointer bg-orange-600 font-semibold text-white duration-300 hover:brightness-75"
            disabled={loading || offer.paymentInProgress}
            onClick={handlePay}
          >
            {loading && <Loader2 className="size-4 animate-spin" />}
            Pagar sinal de {formatCurrency(offer.depositAmount)}
          </Button>
          <p className="text-xs text-white/40">
            O horário só fica reservado depois que o sinal é pago.
          </p>
        </div>
      )}
    </section>
  );
}

function OfferDetail({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs text-white/50">{label}</dt>
      <dd className="text-white first-letter:uppercase">{value}</dd>
    </div>
  );
}
