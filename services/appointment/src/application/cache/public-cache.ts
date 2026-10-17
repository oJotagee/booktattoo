export function blockedTimesCacheNamespace(artistId: string): string {
  return `appointment:public:blocked-times:${artistId}`;
}
