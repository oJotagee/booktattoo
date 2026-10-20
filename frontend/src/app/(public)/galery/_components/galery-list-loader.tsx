import { GALERY_PAGE_SIZE, parseGaleryStyle } from './galery-query';
import { formatGaleryStyle } from '@/utils/formatGalery';
import { parsePageParam } from '@/lib/search-params';
import { JsonLd } from '@/components/json-ld';
import { GaleryList } from './galery-list';
import { SITE_URL } from '@/lib/site';
import {
  getAllPublicGaleries,
  type PublicGalery,
} from '../../_data-access/get-all-public-galeries';

interface GaleryListLoaderProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
  artistId?: string;
}

export async function GaleryListLoader({ searchParams, artistId }: GaleryListLoaderProps) {
  const params = await searchParams;
  const page = parsePageParam(params.page);
  const style = parseGaleryStyle(params.style);
  const offset = (page - 1) * GALERY_PAGE_SIZE;

  const data = await getAllPublicGaleries({
    limit: GALERY_PAGE_SIZE,
    offset,
    style,
    userId: artistId,
  }).catch(() => undefined);

  return (
    <>
      {data && data.list.length > 0 && <JsonLd data={galeryItemList(data.list, offset)} />}
      <GaleryList artistId={artistId} initialData={data && { page, style, data }} />
    </>
  );
}

function galeryItemList(list: PublicGalery[], offset: number) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: list.map((galery, index) => ({
      '@type': 'ListItem',
      position: offset + index + 1,
      item: {
        '@type': 'Product',
        name: galery.title,
        image: galery.imageUrl,
        category: `Flash tattoo ${formatGaleryStyle(galery.style)}`,
        ...(galery.artistName && { brand: { '@type': 'Brand', name: galery.artistName } }),
        offers: {
          '@type': 'Offer',
          price: (galery.price / 100).toFixed(2),
          priceCurrency: 'BRL',
          availability: 'https://schema.org/InStock',
          url: `${SITE_URL}/${galery.userId}`,
        },
      },
    })),
  };
}
