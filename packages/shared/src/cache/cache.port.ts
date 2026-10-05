export const CACHE_PORT = Symbol('CACHE_PORT');

export interface CachePort {
  getOrLoad<T>(key: string, loader: () => Promise<T>): Promise<T>;
}
