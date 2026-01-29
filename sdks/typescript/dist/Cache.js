"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Cache = void 0;
class Cache {
    constructor(expireAfterMs) {
        this.cache = new Map();
        this.expireAfterMs = expireAfterMs;
    }
    set(key, value) {
        this.cache.set(key, {
            value,
            expiresAt: Date.now() + this.expireAfterMs,
        });
    }
    // Allow type override when getting values for better type safety
    get(key) {
        const entry = this.cache.get(key);
        if (!entry)
            return undefined;
        if (Date.now() > entry.expiresAt) {
            this.cache.delete(key);
            return undefined;
        }
        return entry.value;
    }
    invalidate(key) {
        this.cache.delete(key);
    }
    invalidateAll() {
        this.cache.clear();
    }
    get size() {
        return this.cache.size;
    }
}
exports.Cache = Cache;
//# sourceMappingURL=Cache.js.map