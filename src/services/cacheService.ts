import redis from "@/lib/cache/redis";

const KEY_PREFIX = "geta:"; // Global Energy Trade Analytics

function buildKey(namespace: string, ...parts: string[]): string {
  return `${KEY_PREFIX}${namespace}:${parts.join(":")}`;
}

export const cacheService = {
  async get<T>(namespace: string, ...keyParts: string[]): Promise<T | null> {
    try {
      const key = buildKey(namespace, ...keyParts);
      const data = await redis.get<T>(key);
      return data ?? null;
    } catch {
      return null;
    }
  },

  async set<T>(
    namespace: string,
    keyParts: string[],
    value: T,
    ttlSeconds: number
  ): Promise<void> {
    try {
      const key = buildKey(namespace, ...keyParts);
      await redis.set(key, value, { ex: ttlSeconds });
    } catch {
      // Cache failures are non-fatal
    }
  },

  async invalidate(namespace: string, ...keyParts: string[]): Promise<void> {
    try {
      const key = buildKey(namespace, ...keyParts);
      await redis.del(key);
    } catch {
      // Non-fatal
    }
  },

  async invalidatePattern(pattern: string): Promise<void> {
    try {
      const keys = await redis.keys(`${KEY_PREFIX}${pattern}`);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } catch {
      // Non-fatal
    }
  },

  // Pre-built key builders for each data type
  keys: {
    trade: (country: string, energyType: string, direction: string, startYear: number, endYear: number) =>
      ["trade", country, energyType, direction, String(startYear), String(endYear)],

    compare: (countries: string[], energyType: string, startYear: number, endYear: number) =>
      ["compare", countries.sort().join("-"), energyType, String(startYear), String(endYear)],

    stats: (energyType: string, year: number) =>
      ["stats", energyType, String(year)],

    trends: (country: string, energyType: string, direction: string) =>
      ["trends", country, energyType, direction],

    countries: () => ["countries", "all"],
  },
};
