import NodeCache from 'node-cache'

class CacheUtil {
  constructor(protected cache: NodeCache = new NodeCache()) {}

  public set<T>(key: string, value: T, ttl: number): boolean {
    return this.cache.set(key, value, ttl)
  }

  public get<T>(key: string): T | undefined {
    return this.cache.get<T>(key)
  }

  public clearAllCache(): void {
    return this.cache.flushAll()
  }
}

export default new CacheUtil()
