import { ArrowRight } from "lucide-react";
import { Suspense } from "react";
import Link from "next/link";

import {
  FeaturedGaleryCarousel,
  GaleryCarouselSkeleton,
} from "./featured-galery-carousel";
import {
  getAllPublicGaleries,
  type OutputPublicGalery,
} from "../_data-access/get-all-public-galeries";
import { FEATURED_GALERY_LIMIT } from "./featured-galery-limit";

export function Galery() {
  return (
    <Suspense fallback={<GalerySection data={undefined} loading />}>
      <FeaturedGalerySection />
    </Suspense>
  );
}

async function FeaturedGalerySection() {
  const data = await getAllPublicGaleries({
    limit: FEATURED_GALERY_LIMIT,
    offset: 0,
  }).catch(() => undefined);

  if (data && data.list.length === 0) return null;

  return <GalerySection data={data} />;
}

function GalerySection({
  data,
  loading,
}: {
  data?: OutputPublicGalery;
  loading?: boolean;
}) {
  return (
    <section className="relative w-full py-14 px-6 md:px-28 md:py-22">
      <div className="flex flex-row items-end justify-between">
        <div>
          <p className="text-orange-600/80 uppercase text-md mb-5 tracking-widest">
            Galeria
          </p>
          <h2 className="text-white text-3xl md:text-4xl font-bold md:w-sm">
            Itens em destaque
          </h2>
        </div>

        <Link
          href="/galery"
          className="hidden sm:flex flex-row items-center gap-2 justify-end text-white/50 hover:brightness-75 duration-300 text-sm sm:text-base"
        >
          Ver todos
          <ArrowRight className="w-5" />
        </Link>
      </div>

      {loading ? (
        <GaleryCarouselSkeleton />
      ) : (
        <FeaturedGaleryCarousel initialData={data} />
      )}
    </section>
  );
}
