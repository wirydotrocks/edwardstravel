type RateLimitEntry = {
  timestamps: number[];
};

type RateLimitStore = Map<string, RateLimitEntry>;

const globalForRateLimit = globalThis as typeof globalThis & {
  __rateLimitStore?: RateLimitStore;
};

function store(): RateLimitStore {
  if (!globalForRateLimit.__rateLimitStore) {
    globalForRateLimit.__rateLimitStore = new Map();
  }
  return globalForRateLimit.__rateLimitStore;
}

function prune(key: string, windowMs: number, now: number): RateLimitEntry {
  const windowStart = now - windowMs;
  const bucket = store().get(key) ?? { timestamps: [] };
  bucket.timestamps = bucket.timestamps.filter((t) => t > windowStart);
  store().set(key, bucket);
  return bucket;
}

export type RateLimitResult =
  | { ok: true; remaining: number; resetMs: number }
  | { ok: false; retryAfterSec: number; resetMs: number };

function checkWindow(
  key: string,
  limit: number,
  windowMs: number,
  now: number,
): RateLimitResult {
  const bucket = prune(key, windowMs, now);

  if (bucket.timestamps.length >= limit) {
    const oldest = bucket.timestamps[0] ?? now;
    const resetMs = oldest + windowMs - now;
    return {
      ok: false,
      retryAfterSec: Math.max(1, Math.ceil(resetMs / 1000)),
      resetMs,
    };
  }

  return {
    ok: true,
    remaining: limit - bucket.timestamps.length - 1,
    resetMs: windowMs,
  };
}

function commitWindow(key: string, now: number): void {
  const bucket = store().get(key) ?? { timestamps: [] };
  bucket.timestamps.push(now);
  store().set(key, bucket);
}

/**
 * Sliding-window rate limiter. Best-effort on serverless (per instance); pair with
 * edge/WAF limits in production for stronger protection.
 */
export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
): RateLimitResult {
  const now = Date.now();
  const result = checkWindow(key, limit, windowMs, now);
  if (result.ok) commitWindow(key, now);
  return result;
}

/** Apply multiple windows (e.g. per-minute and per-hour caps). */
export function rateLimitMulti(
  key: string,
  windows: ReadonlyArray<{ limit: number; windowMs: number }>,
): RateLimitResult {
  const now = Date.now();
  let tightest: RateLimitResult = { ok: true, remaining: 0, resetMs: 0 };

  for (const { limit, windowMs } of windows) {
    const result = checkWindow(`${key}:${windowMs}`, limit, windowMs, now);
    if (!result.ok) return result;
    if (
      tightest.ok &&
      (tightest.remaining === 0 || result.remaining < tightest.remaining)
    ) {
      tightest = result;
    }
  }

  for (const { windowMs } of windows) {
    commitWindow(`${key}:${windowMs}`, now);
  }

  return tightest.ok ? tightest : { ok: true, remaining: 0, resetMs: 0 };
}
