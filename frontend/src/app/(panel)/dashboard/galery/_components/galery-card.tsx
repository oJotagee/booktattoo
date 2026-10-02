import { Pencil } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from 'cn';

import { GaleryAvailabilitySwitch } from './galery-availability-switch';
import type { Galery } from '../_data-access/get-all-galeries';
import { formatCurrency } from '@/utils/formatService';
import { GaleryStyleBadge } from './galery-style-badge';
import { Button } from '@/components/ui/button';

interface GaleryCardProps {
  galery: Galery;
}

export function GaleryCard({ galery }: GaleryCardProps) {
  return (
    <article className="flex flex-col overflow-hidden rounded-xl border bg-card">
      <div className="relative aspect-4/3 w-full overflow-hidden bg-muted">
        <Image
          src={galery.imageUrl}
          alt={galery.title}
          fill
          sizes="(min-width: 1536px) 20vw, (min-width: 1024px) 25vw, (min-width: 640px) 33vw, 100vw"
          className={cn('object-cover', !galery.available && 'opacity-40 grayscale')}
        />

        {galery.style && (
          <GaleryStyleBadge style={galery.style} className="absolute top-2 left-2" />
        )}

        {!galery.available && (
          <span className="absolute inset-0 m-auto h-fit w-fit rounded-md bg-black/70 px-2 py-1 text-[10px] font-semibold uppercase tracking-widest text-white/80">
            Indisponível
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-3">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold">{galery.title}</h3>
          <p className="truncate text-xs text-muted-foreground">{galery.size}</p>
        </div>

        <div className="mt-auto flex items-center justify-between gap-2">
          <p className="text-sm font-semibold">{formatCurrency(galery.price)}</p>

          <Button
            variant="ghost"
            size="icon-xs"
            className="cursor-pointer text-muted-foreground"
            aria-label={`Editar ${galery.title}`}
            render={<Link href={`/dashboard/galery/edit/${galery.id}`} />}
            nativeButton={false}
          >
            <Pencil />
          </Button>
        </div>

        <div className="border-t pt-2">
          <GaleryAvailabilitySwitch galery={galery} />
        </div>
      </div>
    </article>
  );
}
