import "server-only";

interface Bucket {
  count: number;
  resetAt: number;
}

const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 5;

/**
 * In-memory лимитер — годится для одного инстанса (см. README/деплой).
 * Для нескольких серверных инстансов нужен общий стор (Redis и т.п.),
 * это вне рамок портфолио-проекта.
 */
const buckets = new Map<string, Bucket>();

export function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const bucket = buckets.get(ip);

  if (!bucket || bucket.resetAt < now) {
    buckets.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }

  bucket.count += 1;
  return bucket.count > MAX_REQUESTS_PER_WINDOW;
}
