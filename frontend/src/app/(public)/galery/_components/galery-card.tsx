'use client';

import { ChevronRight } from 'lucide-react';
import { useState } from 'react';
import Image from 'next/image';
import { cn } from 'cn';

import { formatGaleryStyle, galeryStyleBadgeClass } from '@/utils/formatGalery';
import type { PublicGalery } from '../../_data-access/get-all-public-galeries';
import { BookingDialog } from '../../_components/booking/booking-dialog';
import { formatCurrency } from '@/utils/formatService';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface GaleryCardProps {
  galery: PublicGalery;
  artistName?: string;
}

export function GaleryCard({ galery, artistName }: GaleryCardProps) {
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  return (
    <article className="flex flex-col overflow-hidden rounded-xl border bg-card">
      <div className="relative aspect-square w-full overflow-hidden bg-muted">
        <Image
          src={galery.imageUrl}
          alt={galery.title}
          fill
          sizes="(min-width: 1536px) 20vw, (min-width: 1024px) 25vw, (min-width: 768px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover"
        />

        <Badge
          className={cn('absolute top-3 left-3 font-semibold', galeryStyleBadgeClass(galery.style))}
        >
          {formatGaleryStyle(galery.style)}
        </Badge>
      </div>

      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="min-w-0">
          <h3 className="truncate text-white font-semibold">{galery.title}</h3>
          <p className="truncate text-xs text-white/50">
            {artistName ? `${galery.size} · ${artistName}` : galery.size}
          </p>
        </div>

        <div className="mt-auto flex items-end justify-between gap-2">
          <div>
            <span className="text-xs text-white/50">A partir de</span>
            <p className="text-white font-semibold">{formatCurrency(galery.price)}</p>
          </div>

          <Button
            className="bg-orange-600 text-white hover:brightness-75 duration-300 font-semibold cursor-pointer"
            onClick={() => setIsBookingOpen(true)}
          >
            Agendar
            <ChevronRight />
          </Button>
        </div>
      </div>

      <BookingDialog galery={galery} open={isBookingOpen} onOpenChange={setIsBookingOpen} />
    </article>
  );
}
