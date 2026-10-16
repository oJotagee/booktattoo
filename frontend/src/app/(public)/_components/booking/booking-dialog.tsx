'use client';

import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

import type { PublicGalery } from '../../_data-access/get-all-public-galeries';
import { getPublicArtist } from '../../_data-access/get-public-artist';
import { getPublicGalery } from '../../_data-access/get-public-galery';
import { BookingStepDetails } from './booking-step-details';
import { BookingStepPayment } from './booking-step-payment';
import { Skeleton } from '@/components/ui/skeleton';
import { BookingSummary } from './booking-summary';
import { useBookingSchema } from './schemas';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

type BookingStep = 1 | 2;

const BOOKABLE_ARTIST_STATUS = 'ACTIVE';

const STEP_TITLES: Record<BookingStep, string> = {
  1: 'Data, horário e seus dados',
  2: 'Pagamento do sinal',
};

interface BookingDialogProps {
  galery: PublicGalery;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BookingDialog({ galery, open, onOpenChange }: BookingDialogProps) {
  const [step, setStep] = useState<BookingStep>(1);

  function handleOpenChange(next: boolean) {
    if (!next) setStep(1);
    onOpenChange(next);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[92vh] gap-0 overflow-y-auto p-0 sm:max-w-lg">
        <DialogHeader className="gap-1 border-b px-6 py-5 pr-14">
          <span className="text-xs font-medium uppercase tracking-widest text-white/50">
            Passo {step} de 2
          </span>
          <DialogTitle className="font-serif text-2xl font-normal text-white">
            {STEP_TITLES[step]}
          </DialogTitle>
          <DialogDescription className="sr-only">
            Agende o flash {galery.title} e pague o sinal para reservar o horário.
          </DialogDescription>
        </DialogHeader>

        <BookingSummary galery={galery} />

        {open && <BookingFlow galery={galery} step={step} onStepChange={setStep} />}
      </DialogContent>
    </Dialog>
  );
}

interface BookingFlowProps {
  galery: PublicGalery;
  step: BookingStep;
  onStepChange: (step: BookingStep) => void;
}

function BookingFlow({ galery, step, onStepChange }: BookingFlowProps) {
  const form = useBookingSchema();

  const artistQuery = useQuery({
    queryKey: ['public-artist', galery.userId],
    queryFn: () => getPublicArtist(galery.userId),
  });

  const galeryQuery = useQuery({
    queryKey: ['public-galery', galery.id],
    queryFn: () => getPublicGalery(galery.id),
  });

  if (artistQuery.isPending || galeryQuery.isPending) return <BookingFlowSkeleton />;

  if (artistQuery.isError || galeryQuery.isError || !artistQuery.data) {
    return (
      <p className="px-6 py-10 text-center text-sm text-white/60">
        Não foi possível carregar a agenda deste tatuador. Tente novamente mais tarde.
      </p>
    );
  }

  if (artistQuery.data.status !== BOOKABLE_ARTIST_STATUS) {
    return (
      <p className="px-6 py-10 text-center text-sm text-white/60">
        Este tatuador não está recebendo agendamentos no momento.
      </p>
    );
  }

  if (!galeryQuery.data.available) {
    return (
      <p className="px-6 py-10 text-center text-sm text-white/60">
        Este flash acabou de ser reservado e não está mais disponível.
      </p>
    );
  }

  const { service } = galeryQuery.data;

  if (step === 2) {
    return (
      <BookingStepPayment
        values={form.getValues()}
        artistId={galery.userId}
        galeryId={galery.id}
        price={galeryQuery.data.price}
        depositAmount={service.depositAmount}
        onBack={() => onStepChange(1)}
      />
    );
  }

  return (
    <BookingStepDetails
      form={form}
      artistId={galery.userId}
      times={artistQuery.data.times}
      duration={service.duration}
      onContinue={() => onStepChange(2)}
    />
  );
}

function BookingFlowSkeleton() {
  return (
    <div className="flex flex-col gap-6 px-6 py-5">
      <div className="grid gap-6 sm:grid-cols-2">
        <Skeleton className="h-11" />
        <div className="grid grid-cols-2 gap-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-9" />
          ))}
        </div>
      </div>
      <Skeleton className="h-11" />
      <Skeleton className="h-11" />
      <Skeleton className="h-11" />
    </div>
  );
}
