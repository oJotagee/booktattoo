import Image from 'next/image';

import type { Artist } from '../../_data-access/get-all-artists';
import { getInitials } from '@/lib/utils';

interface ArtistCardProps {
  artist: Artist;
  position: number;
}

export function ArtistCard({ artist, position }: ArtistCardProps) {
  return (
    <article className="group">
      <div className="relative isolate aspect-4/5 w-full overflow-hidden rounded-2xl bg-mist-800">
        {artist.image ? (
          <Image
            src={artist.image}
            alt={artist.name}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            className="object-cover grayscale will-change-[filter,scale] transition-[filter,scale] duration-500 ease-out group-hover:grayscale-0 group-hover:scale-105"
          />
        ) : (
          <div className="flex w-full h-full items-center justify-center text-white/60 text-4xl font-bold">
            {getInitials(artist.name)}
          </div>
        )}

        <span className="absolute top-3 left-4 text-xs font-semibold text-white/70">
          {String(position).padStart(2, '0')}
        </span>
      </div>

      <div className="flex flex-col gap-1 pt-4">
        <h3 className="text-white text-lg font-semibold truncate capitalize">{artist.name}</h3>
        <span className="text-white/50 text-xs uppercase tracking-wider truncate">
          {artist.role ? artist.role : 'N/A'}
        </span>
      </div>
    </article>
  );
}
