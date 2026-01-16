class Cache<T> {
  final Map<String, _CacheEntry<T>> _cache = {};
  final Duration expireAfter;

  Cache({required this.expireAfter});

  void set(String key, T value) {
    _cache[key] = _CacheEntry(
      value: value,
      expiresAt: DateTime.now().add(expireAfter),
    );
  }

  T? get(String key) {
    final entry = _cache[key];
    if (entry == null) return null;

    if (DateTime.now().isAfter(entry.expiresAt)) {
      _cache.remove(key);
      return null;
    }

    return entry.value;
  }

  void invalidate(String key) {
    _cache.remove(key);
  }

  void invalidateAll() {
    _cache.clear();
  }

  int get size => _cache.length;
}

class _CacheEntry<T> {
  final T value;
  final DateTime expiresAt;

  _CacheEntry({required this.value, required this.expiresAt});
}
