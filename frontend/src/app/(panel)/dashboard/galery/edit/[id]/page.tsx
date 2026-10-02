import { notFound } from 'next/navigation';

import { getAllServices } from '../../../services/_data-access/get-all-services';
import { getGaleryById } from '../../_data-access/get-galery-by-id';
import { GaleryForm } from '../../_components/galery-form';
import DashboardHeader from '../../../_components/header';

const SERVICES_LIMIT = 100;

interface EditGaleryPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditGaleryPage({ params }: EditGaleryPageProps) {
  const { id } = await params;

  const [galery, services] = await Promise.all([
    getGaleryById(id),
    getAllServices({ limit: SERVICES_LIMIT, offset: 0 }),
  ]);

  if (!galery) notFound();

  const availableServices = services.list.filter(
    (service) => service.status || service.id === galery.serviceId,
  );

  return (
    <>
      <DashboardHeader title="Editar flash" subtitle={galery.title} />

      <h1 className="text-xl font-bold md:hidden">Editar flash</h1>
      <h2 className="text-white/30 text-sm mb-4 md:hidden">{galery.title}</h2>

      <GaleryForm galery={galery} services={availableServices} />
    </>
  );
}
