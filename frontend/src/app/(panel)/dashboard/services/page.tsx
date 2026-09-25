import ServiceContent from './_components/service-content';
import DashboardHeader from '../_components/header';
import { getAllServices } from './_data_access/get-all-services';

const PAGE_SIZE = 5;

interface ServicesPageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function ServicesPage({ searchParams }: ServicesPageProps) {
  const { page } = await searchParams;
  const currentPage = Math.max(Number(page) || 1, 1);

  const services = await getAllServices({
    limit: PAGE_SIZE,
    offset: (currentPage - 1) * PAGE_SIZE,
  });

  return (
    <>
      <DashboardHeader
        title="Serviços"
        subtitle={`${services.pagination.total} serviços cadastrados`}
      />

      <h1 className="text-xl font-bold md:hidden">Serviços</h1>
      <h2 className="text-white/30 text-sm mb-4 md:hidden">{services.pagination.total} serviços cadastrados</h2>

      <ServiceContent services={services.list} pagination={services.pagination} />
    </>
  );
}
