export const ASSET_TYPES = {
  AVATAR: 'avatars',
  GALLERY: 'gallery',
  PORTFOLIO: 'portfolio',
  DOCUMENT: 'documents',
  APPOINTMENT: 'appointments',
} as const;

export type AssetType = (typeof ASSET_TYPES)[keyof typeof ASSET_TYPES];
