import type { OutputPublicGalery } from '../../_data-access/get-all-public-galeries';
import { firstParam, type SearchParamValue } from '@/lib/search-params';
import { type GaleryStyle, isGaleryStyle } from '@/utils/formatGalery';

export const GALERY_PAGE_SIZE = 10;

export interface GaleryListInitialData {
  page: number;
  style?: GaleryStyle;
  data: OutputPublicGalery;
}

export function parseGaleryStyle(value: SearchParamValue): GaleryStyle | undefined {
  const style = firstParam(value);
  return isGaleryStyle(style) ? style : undefined;
}
