import { ServiceTableSkeleton } from './_components/service-table-skeleton';
import DashboardHeader from '../_components/header';

export default function ServicesLoading() {
  return (
    <>
      <DashboardHeader title="Serviços" />

      <ServiceTableSkeleton rows={5} />
    </>
  );
}
