export class Cache<T> {
  private cache = new Map<string, { value: T; expiresAt: number }>();
  private readonly expireAfterMs: number;

  constructor(expireAfterMs: number) {
    this.expireAfterMs = expireAfterMs;
  }

  set(key: string, value: T): void {
    this.cache.set(key, {
      value,
      expiresAt: Date.now() + this.expireAfterMs,
    });
  }

  // Allow type override when getting values for better type safety
  get<U = T>(key: string): U | undefined {
    const entry = this.cache.get(key);
    if (!entry) return undefined;

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return undefined;
    }

    return entry.value as unknown as U;
  }

  invalidate(key: string): void {
    this.cache.delete(key);
  }

  invalidateAll(): void {
    this.cache.clear();
  }

  get size(): number {
    return this.cache.size;
  }
}
