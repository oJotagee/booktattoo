'use client';

import { MessageSquare } from 'lucide-react';
import { useState } from 'react';

import { BookingRequestDialog } from './booking-request-dialog';
import { Button } from '@/components/ui/button';

interface BookingRequestSectionProps {
  artistId: string;
  artistName: string;
}

export function BookingRequestSection({ artistId, artistName }: BookingRequestSectionProps) {
  const [open, setOpen] = useState(false);
  const [firstName] = artistName.split(' ');

  return (
    <section
      aria-labelledby="booking-request"
      className="mt-14 flex flex-col gap-5 rounded-2xl border border-white/10 bg-white/2 px-6 py-6 md:flex-row md:items-center md:justify-between"
    >
      <div className="space-y-1">
        <h2 id="booking-request" className="text-white text-lg font-semibold">
          Quer algo fora da galeria?
        </h2>
        <p className="max-w-xl text-sm text-white/50">
          Tatuagem autoral, orçamento ou alguma dúvida: mande uma mensagem e converse direto com{' '}
          <span className="capitalize">{firstName}</span>, sem precisar criar conta.
        </p>
      </div>

      <Button
        size="lg"
        className="h-11 cursor-pointer bg-orange-600 font-semibold text-white duration-300 hover:brightness-75"
        onClick={() => setOpen(true)}
      >
        <MessageSquare />
        <span>
          Conversar com <span className="capitalize">{firstName}</span>
        </span>
      </Button>

      <BookingRequestDialog
        artistId={artistId}
        artistName={artistName}
        open={open}
        onOpenChange={setOpen}
      />
    </section>
  );
}
