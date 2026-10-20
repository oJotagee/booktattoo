'use client';

import { useQuery } from '@tanstack/react-query';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { Carousel, CarouselContent, CarouselItem, CarouselSlider } from '@/components/ui/carousel';
import { FEATURED_GALERY_LIMIT } from './featured-galery-limit';
import { formatCurrency } from '@/utils/formatService';
import { Skeleton } from '@/components/ui/skeleton';
import { useIsMobile } from '@/hooks/use-mobile';
import { Card } from '@/components/ui/card';
import {
  getAllPublicGaleries,
  type OutputPublicGalery,
} from '../_data-access/get-all-public-galeries';

interface FeaturedGaleryCarouselProps {
  initialData?: OutputPublicGalery;
}

export function FeaturedGaleryCarousel({ initialData }: FeaturedGaleryCarouselProps) {
  const isMobile = useIsMobile();

  const { data, isPending, isError } = useQuery({
    queryKey: ['public-galeries', 'featured'],
    queryFn: () => getAllPublicGaleries({ limit: FEATURED_GALERY_LIMIT, offset: 0 }),
    initialData,
    staleTime: 30_000,
  });

  if (isError) {
    return (
      <p className="mt-10 text-center text-white/60">
        Não foi possível carregar a galeria, tente novamente mais tarde.
      </p>
    );
  }

  if (isPending) return <GaleryCarouselSkeleton />;

  if (data.list.length === 0) {
    return <p className="mt-10 text-center text-white/60">Nenhum flash disponível no momento.</p>;
  }

  return (
    <Carousel
      opts={{
        align: 'start',
        containScroll: 'trimSnaps',
        slidesToScroll: 'auto',
      }}
      className="mt-10 w-full"
    >
      <CarouselContent>
        {data.list.map((flash) => (
          <CarouselItem key={flash.id} className="basis-[65%] sm:basis-[38%] lg:basis-[21%]">
            <Card className="gap-0 overflow-hidden py-0">
              <div className="relative aspect-square w-full">
                <Image
                  src={flash.imageUrl}
                  alt={flash.title}
                  fill
                  sizes="(min-width: 1024px) 21vw, (min-width: 640px) 38vw, 65vw"
                  className="object-cover"
                />
              </div>
              <div className="flex flex-col p-4">
                <span className="text-white font-medium truncate">{flash.title}</span>
                <span className="text-white/50 text-sm">{formatCurrency(flash.price)}</span>
              </div>
            </Card>
          </CarouselItem>
        ))}

        {isMobile && (
          <CarouselItem className="basis-[35%]">
            <Link
              href="/galery"
              className="flex h-full flex-col items-center justify-center gap-2 rounded-xl text-white/50 hover:brightness-75 duration-300 py-4"
            >
              Ver todos
              <ArrowRight className="w-5" />
            </Link>
          </CarouselItem>
        )}
      </CarouselContent>

      <CarouselSlider className="mx-auto max-w-xs" />
    </Carousel>
  );
}

export function GaleryCarouselSkeleton() {
  return (
    <div className="mt-10 flex gap-4 overflow-hidden">
      {Array.from({ length: 5 }).map((_, index) => (
        <Card
          key={index}
          className="shrink-0 basis-[65%] gap-0 overflow-hidden py-0 sm:basis-[38%] lg:basis-[21%]"
        >
          <Skeleton className="aspect-square w-full rounded-none" />
          <div className="flex flex-col gap-2 p-4">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </Card>
      ))}
    </div>
  );
}
