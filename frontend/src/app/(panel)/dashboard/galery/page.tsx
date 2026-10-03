import { Suspense } from 'react';

import { GaleryPageSkeleton } from './_components/galery-page-skeleton';
import { getAllGaleries } from './_data-access/get-all-galeries';
import { GaleryList } from './_components/galery-list';
import { isGaleryStyle } from '@/utils/formatGalery';
import { canPermission } from '@/utils/permissions/can-permission';
import { LabelSubscription } from '@/components/label-subscription';
import DashboardHeader from '../_components/header';

const PAGE_SIZE = 10;

interface GaleryPageProps {
  searchParams: Promise<{ page?: string; style?: string }>;
}

export default function GaleryPage({ searchParams }: GaleryPageProps) {
  return (
    <Suspense fallback={<GaleryPageSkeleton items={PAGE_SIZE} />}>
      <GaleryPageList searchParams={searchParams} />
    </Suspense>
  );
}

async function GaleryPageList({ searchParams }: GaleryPageProps) {
  const { page, style } = await searchParams;
  const currentPage = Math.max(Number(page) || 1, 1);
  const currentStyle = isGaleryStyle(style) ? style : undefined;

  const [galeries, permission] = await Promise.all([
    getAllGaleries({
      limit: PAGE_SIZE,
      offset: (currentPage - 1) * PAGE_SIZE,
      style: currentStyle,
    }),
    canPermission({ type: 'galery' }),
  ]);

  const subtitle = `${galeries.pagination.total} itens cadastrados`;

  return (
    <>
      <DashboardHeader title="Galeria" subtitle={subtitle} />

      <h1 className="text-xl font-bold md:hidden">Galeria</h1>
      <h2 className="text-white/30 text-sm mb-4 md:hidden">{subtitle}</h2>

      {!permission.hasPermission && (
        <LabelSubscription
          expired={permission.expired}
          limit={permission.limit}
          resource="flashs na galeria"
        />
      )}

      <GaleryList
        galeries={galeries.list}
        pagination={galeries.pagination}
        style={currentStyle}
        canCreate={permission.hasPermission}
      />
    </>
  );
}
