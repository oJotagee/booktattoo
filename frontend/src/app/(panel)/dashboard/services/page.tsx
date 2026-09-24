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

      <ServiceContent services={services.list} pagination={services.pagination} />
    </>
  );
}
