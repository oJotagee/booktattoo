import type { PaginationService, Service } from '../_data-access/get-all-services';
import type { ResultPermission } from '@/utils/permissions/can-permission';
import { LabelSubscription } from '@/components/label-subscription';
import { ServiceList } from './service-list';

interface ServiceContentProps {
  services: Service[];
  pagination: PaginationService;
  permission: ResultPermission;
}

export default function ServiceContent({ services, pagination, permission }: ServiceContentProps) {
  return (
    <>
      {!permission.hasPermission && (
        <LabelSubscription
          expired={permission.expired}
          limit={permission.limit}
          resource="serviços"
        />
      )}

      <ServiceList
        services={services}
        pagination={pagination}
        canCreate={permission.hasPermission}
      />
    </>
  );
}
