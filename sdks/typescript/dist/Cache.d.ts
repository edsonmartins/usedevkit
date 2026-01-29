export declare class Cache<T> {
    private cache;
    private readonly expireAfterMs;
    constructor(expireAfterMs: number);
    set(key: string, value: T): void;
    get<U = T>(key: string): U | undefined;
    invalidate(key: string): void;
    invalidateAll(): void;
    get size(): number;
}
//# sourceMappingURL=Cache.d.ts.map