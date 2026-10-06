export const CACHE_PORT = Symbol('CACHE_PORT');

export interface CachePort {
  getOrLoad<T>(namespace: string, key: string, loader: () => Promise<T>): Promise<T>;

  invalidate(namespace: string): Promise<void>;
}
