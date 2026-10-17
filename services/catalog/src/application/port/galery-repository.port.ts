import type { GaleryEntity, GaleryStyle } from '@/domain/entities/galery.entity';
import type {
  FindByUserIdParams,
  FindPublicParams,
  PaginatedResult,
} from './service-repository.port';

export const GALERY_REPOSITORY = Symbol('GALERY_REPOSITORY');

export type FindGaleriesByUserIdParams = FindByUserIdParams & {
  style?: GaleryStyle;
};

export type FindPublicGaleriesParams = FindPublicParams & {
  style?: GaleryStyle;
  excludeUserIds?: string[];
};

export interface GaleryRepository {
  findById(id: string): Promise<GaleryEntity | null>;
  findByUserId(params: FindGaleriesByUserIdParams): Promise<PaginatedResult<GaleryEntity>>;
  findPublic(params: FindPublicGaleriesParams): Promise<PaginatedResult<GaleryEntity>>;
  countByUserId(userId: string): Promise<number>;
  countAvailableByUserId(userId: string): Promise<number>;
  findLowestPriceByServiceId(serviceId: string): Promise<number | null>;
  create(galery: GaleryEntity): Promise<void>;
  update(galery: GaleryEntity): Promise<void>;
  delete(id: string): Promise<void>;
}
