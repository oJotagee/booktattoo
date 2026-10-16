import Image from 'next/image';

import type { PublicGalery } from '../../_data-access/get-all-public-galeries';
import { formatGaleryStyle } from '@/utils/formatGalery';
import { formatCurrency } from '@/utils/formatService';

interface BookingSummaryProps {
  galery: PublicGalery;
}

export function BookingSummary({ galery }: BookingSummaryProps) {
  const details = [formatGaleryStyle(galery.style), galery.size, galery.artistName].filter(Boolean);

  return (
    <div className="flex items-center gap-4 border-b px-6 py-4">
      <div className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-muted">
        <Image
          src={galery.imageUrl}
          alt={galery.title}
          fill
          sizes="56px"
          className="object-cover"
        />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate font-serif text-lg text-white">{galery.title}</p>
        <p className="truncate text-xs text-white/50">{details.join(' · ')}</p>
      </div>

      <div className="shrink-0 text-right">
        <span className="text-xs text-white/50">Total</span>
        <p className="font-serif text-lg text-white">{formatCurrency(galery.price)}</p>
      </div>
    </div>
  );
}
