"use client";

import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselSlider,
} from "@/components/ui/carousel";
import { Skeleton } from "@/components/ui/skeleton";
import { useIsMobile } from "@/hooks/use-mobile";

const flashes = [
  {
    id: 1,
    title: "Rosa Tradicional",
    price: "R$ 280,00",
    image: "/flash-1.jpg",
  },
  {
    id: 2,
    title: "Cobra Japonesa",
    price: "R$ 420,00",
    image: "/flash-2.jpg",
  },
  {
    id: 3,
    title: "Crânio Blackwork",
    price: "R$ 350,00",
    image: "/flash-3.jpg",
  },
  {
    id: 4,
    title: "Borboleta Fineline",
    price: "R$ 220,00",
    image: "/flash-4.jpg",
  },
  {
    id: 5,
    title: "Pantera Neotradicional",
    price: "R$ 480,00",
    image: "/flash-5.jpg",
  },
  {
    id: 6,
    title: "Caveira Mexicana",
    price: "R$ 360,00",
    image: "/flash-6.jpg",
  },
];

export function Galery() {
  const isLoading = false;
  const isMobile = useIsMobile();

  return (
    <section className="relative w-full py-14 px-6 md:px-28 md:py-22">
      <div className="flex flex-row items-end justify-between">
        <div>
          <h2 className="text-orange-600/80 uppercase text-md mb-5 tracking-widest">
            Galeria
          </h2>
          <h1 className="text-white text-3xl md:text-4xl font-bold md:w-sm">
            Flashs em destaque
          </h1>
        </div>

        <Link
          href="/flash"
          className="hidden sm:flex flex-row items-center gap-2 justify-end text-white/50 hover:brightness-75 duration-300 text-sm sm:text-base">
          Ver todos
          <ArrowRight className="w-5" />
        </Link>
      </div>

      <Carousel
        opts={{
          align: "start",
          containScroll: "trimSnaps",
          slidesToScroll: "auto",
        }}
        className="mt-10 w-full">
        <CarouselContent>
          {isLoading
            ? Array.from({ length: 5 }).map((_, index) => (
              <CarouselItem
                key={index}
                className="basis-[65%] sm:basis-[38%] lg:basis-[21%]">
                <Card className="gap-0 overflow-hidden py-0">
                  <Skeleton className="aspect-square w-full rounded-none" />
                  <div className="flex flex-col gap-2 p-4">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </Card>
              </CarouselItem>
            ))
            : flashes.map((flash) => (
              <CarouselItem
                key={flash.id}
                className="basis-[65%] sm:basis-[38%] lg:basis-[21%]">
                <Card className="gap-0 overflow-hidden py-0">
                  <div className="relative aspect-square w-full">
                    <Image
                      src={flash.image}
                      alt={flash.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex flex-col p-4">
                    <span className="text-white font-medium truncate">
                      {flash.title}
                    </span>
                    <span className="text-white/50 text-sm">
                      {flash.price}
                    </span>
                  </div>
                </Card>
              </CarouselItem>
            ))}

          {!isLoading && isMobile && (
            <CarouselItem className="basis-[35%]">
              <Link
                href="/flash"
                className="flex h-full flex-col items-center justify-center gap-2 rounded-xl text-white/50 hover:brightness-75 duration-300 py-4">
                Ver todos
                <ArrowRight className="w-5" />
              </Link>
            </CarouselItem>
          )}
        </CarouselContent>

        <CarouselSlider className="mx-auto max-w-xs" />
      </Carousel>
    </section>
  );
}
