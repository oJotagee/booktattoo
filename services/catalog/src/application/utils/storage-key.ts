import type { AssetType } from '@bookink/shared/storage';

export function extractStorageKey(url: string, assetType: AssetType): string | null {
  const marker = `${assetType}/`;
  const markerIndex = url.indexOf(marker);
  if (markerIndex === -1) return null;

  return url.slice(markerIndex);
}
