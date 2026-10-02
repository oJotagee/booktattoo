import { ImageIcon } from 'lucide-react';
import { cn } from 'cn';

import type { GaleryStyle } from '@/utils/formatGalery';
import { formatCurrency } from '@/utils/formatService';
import { GaleryStyleBadge } from './galery-style-badge';

interface GaleryCardPreviewProps {
  imageUrl: string | null;
  title: string;
  style: GaleryStyle;
  size: string;
  price: number;
  available: boolean;
}

export function GaleryCardPreview({
  imageUrl,
  title,
  style,
  size,
  price,
  available,
}: GaleryCardPreviewProps) {
  return (
    <div className="rounded-xl border bg-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
          Prévia do card
        </span>
        <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <span
            className={cn('size-2 rounded-full', available ? 'bg-orange-600' : 'bg-white/30')}
          />
          {available ? 'Disponível' : 'Indisponível'}
        </span>
      </div>

      <div className="overflow-hidden rounded-xl border">
        <div className="relative aspect-square w-full bg-muted">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={title || 'Prévia do flash'}
              className={cn('size-full object-cover', !available && 'opacity-40 grayscale')}
            />
          ) : (
            <div className="flex size-full flex-col items-center justify-center gap-2 text-muted-foreground">
              <ImageIcon className="size-6" />
              <span className="text-sm">Sua arte aparece aqui</span>
            </div>
          )}

          <GaleryStyleBadge style={style} className="absolute top-3 left-3" />
        </div>

        <div className="space-y-4 p-4">
          <div className="min-w-0">
            <h3 className="truncate text-lg font-semibold">{title || 'Nome do flash'}</h3>
            <p className="text-sm text-muted-foreground">{size || 'Tamanho'}</p>
          </div>

          <div className="border-t pt-3">
            <span className="text-xs uppercase text-muted-foreground">A partir de</span>
            <p className="text-lg font-semibold">{price > 0 ? formatCurrency(price) : 'R$ —'}</p>
          </div>
        </div>
      </div>

      <p className="mt-4 text-sm text-muted-foreground">
        Assim seu flash aparecerá para quem visitar a galeria.
      </p>
    </div>
  );
}
