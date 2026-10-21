'use client';

import { CalendarPlus, Loader2 } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';

import type { BookingOffer } from '@/components/conversation/types';
import { formatOfferDate } from '@/components/conversation/format-offer-date';
import { formatCurrency, formatDuration } from '@/utils/formatService';
import { withdrawBookingOffer } from '../_actions/withdraw-booking-offer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { OfferDialog } from './offer-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface OfferSectionProps {
  requestId: string;
  artistId: string;
  times: string[];
  paymentsEnabled: boolean;
  closed: boolean;
  offer: BookingOffer | null;
  onChanged: () => Promise<void> | void;
}

export function OfferSection({
  requestId,
  artistId,
  times,
  paymentsEnabled,
  closed,
  offer,
  onChanged,
}: OfferSectionProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);

  const { mutateAsync: withdrawMutation, isPending: isWithdrawing } = useMutation({
    mutationFn: withdrawBookingOffer,
  });

  const visibleOffer = offer && offer.status !== 'WITHDRAWN' ? offer : null;
  const pending = visibleOffer?.status === 'PENDING';
  const paymentInProgress = pending && visibleOffer.paymentInProgress;

  async function handleCreated() {
    setDialogOpen(false);
    await onChanged();
  }

  async function handleWithdraw() {
    const response = await withdrawMutation(requestId);

    if (response.error) {
      toast.error(response.error);
      await onChanged();
      return;
    }

    toast.success('Proposta retirada');
    setWithdrawOpen(false);
    await onChanged();
  }

  if (closed && !visibleOffer) return null;

  return (
    <section aria-label="Proposta de agendamento" className="flex flex-col gap-3">
      {visibleOffer && (
        <div className="flex flex-col gap-4 rounded-xl border bg-card p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Proposta de agendamento</p>
              <h2 className="font-semibold">{visibleOffer.title}</h2>
            </div>
            <OfferStatusBadge offer={visibleOffer} />
          </div>

          <dl className="grid gap-3 text-sm">
            <OfferDetail label="Data" value={formatOfferDate(visibleOffer.scheduledAt)} />
            <OfferDetail label="Duração" value={formatDuration(visibleOffer.duration)} />
            <div className="grid grid-cols-2 gap-3">
              <OfferDetail label="Valor total" value={formatCurrency(visibleOffer.price)} />
              <OfferDetail label="Sinal" value={formatCurrency(visibleOffer.depositAmount)} />
            </div>
          </dl>

          {paymentInProgress && (
            <p className="text-xs text-muted-foreground">
              O cliente está na página de pagamento. A proposta não pode ser alterada até ele
              concluir ou o pagamento expirar.
            </p>
          )}

          {pending && visibleOffer.expired && (
            <p className="text-xs text-muted-foreground">
              O horário desta proposta já passou. Envie uma nova proposta com outra data.
            </p>
          )}

          {pending && !closed && (
            <Button
              variant="outline"
              className="cursor-pointer"
              disabled={paymentInProgress}
              onClick={() => setWithdrawOpen(true)}
            >
              Retirar proposta
            </Button>
          )}
        </div>
      )}

      {!closed &&
        (paymentsEnabled ? (
          <Button
            className="cursor-pointer bg-orange-600 font-semibold text-white duration-300 hover:brightness-75"
            disabled={paymentInProgress}
            onClick={() => setDialogOpen(true)}
          >
            <CalendarPlus />
            {pending ? 'Enviar nova proposta' : 'Criar proposta de agendamento'}
          </Button>
        ) : (
          <p className="rounded-xl border bg-card p-4 text-sm text-muted-foreground">
            Para enviar propostas de agendamento,{' '}
            <Link href="/dashboard/payments" className="text-foreground underline">
              ative os pagamentos
            </Link>
            .
          </p>
        ))}

      <OfferDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        requestId={requestId}
        artistId={artistId}
        times={times}
        replacing={pending}
        onCreated={handleCreated}
      />

      <Dialog open={withdrawOpen} onOpenChange={setWithdrawOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Retirar proposta?</DialogTitle>
            <DialogDescription>
              O cliente não poderá mais pagar o sinal desta proposta. Você pode enviar uma nova
              depois.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              variant="outline"
              className="cursor-pointer"
              disabled={isWithdrawing}
              onClick={() => setWithdrawOpen(false)}
            >
              Voltar
            </Button>
            <Button
              variant="destructive"
              className="cursor-pointer"
              disabled={isWithdrawing}
              onClick={handleWithdraw}
            >
              {isWithdrawing && <Loader2 className="size-4 animate-spin" />}
              Retirar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}

function OfferStatusBadge({ offer }: { offer: BookingOffer }) {
  if (offer.status === 'PAID') {
    return <Badge className="shrink-0 bg-emerald-600/15 text-emerald-500">Paga</Badge>;
  }

  if (offer.status === 'CANCELLED') {
    return (
      <Badge variant="outline" className="shrink-0 text-muted-foreground">
        Agendamento cancelado
      </Badge>
    );
  }

  if (offer.expired) {
    return (
      <Badge variant="outline" className="shrink-0 text-muted-foreground">
        Expirada
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className="shrink-0 text-orange-500">
      {offer.paymentInProgress ? 'Cliente pagando agora…' : 'Aguardando pagamento'}
    </Badge>
  );
}

function OfferDetail({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="first-letter:uppercase">{value}</dd>
    </div>
  );
}
