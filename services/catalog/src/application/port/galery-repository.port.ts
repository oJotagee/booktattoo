import type { FindByUserIdParams, PaginatedResult } from './service-repository.port';
import type { GaleryEntity, GaleryStyle } from '@/domain/entities/galery.entity';

export const GALERY_REPOSITORY = Symbol('GALERY_REPOSITORY');

export type FindGaleriesByUserIdParams = FindByUserIdParams & {
  style?: GaleryStyle;
};

export interface GaleryRepository {
  findById(id: string): Promise<GaleryEntity | null>;
  findByUserId(params: FindGaleriesByUserIdParams): Promise<PaginatedResult<GaleryEntity>>;
  create(galery: GaleryEntity): Promise<void>;
  update(galery: GaleryEntity): Promise<void>;
  delete(id: string): Promise<void>;
}
