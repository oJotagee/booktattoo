import { getAllServices } from '../../services/_data-access/get-all-services';
import { GaleryForm } from '../_components/galery-form';
import DashboardHeader from '../../_components/header';

const SERVICES_LIMIT = 100;

export default async function NewGaleryPage() {
  const services = await getAllServices({ limit: SERVICES_LIMIT, offset: 0 });
  const activeServices = services.list.filter((service) => service.status);

  return (
    <>
      <DashboardHeader title="Novo flash" subtitle="Uma nova peça para o acervo" />

      <h1 className="text-xl font-bold md:hidden">Novo flash</h1>
      <h2 className="text-white/30 text-sm mb-4 md:hidden">Uma nova peça para o acervo</h2>

      <GaleryForm services={activeServices} />
    </>
  );
}
