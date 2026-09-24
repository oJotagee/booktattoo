import type { PaginationService, Service } from '../_data_access/get-all-services';
import { ServiceList } from './service-list';

interface ServiceContentProps {
  services: Service[];
  pagination: PaginationService;
}

export default function ServiceContent({ services, pagination }: ServiceContentProps) {
  return <ServiceList services={services} pagination={pagination} />;
}
