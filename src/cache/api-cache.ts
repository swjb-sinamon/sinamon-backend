export interface ApiCache<T> {
  readonly cacheKey: string;
  fetchCache: () => void | Promise<void>;
  getCacheData: () => T | Promise<T>;
}
