import { randomUUID } from 'node:crypto';
import type { AssetType } from './asset-type';

function sanitizeFilename(filename: string): string {
  const lastDot = filename.lastIndexOf('.');
  const name = lastDot > 0 ? filename.slice(0, lastDot) : filename;
  const ext = lastDot > 0 ? filename.slice(lastDot) : '';

  const safeName = name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-zA-Z0-9-_]/g, '-')
    .toLowerCase();

  return `${safeName}${ext.toLowerCase()}`;
}


export function buildObjectKey(assetType: AssetType, ownerId: string, filename: string): string {
  const unique = randomUUID();
  return `${assetType}/${ownerId}/${unique}-${sanitizeFilename(filename)}`;
}
