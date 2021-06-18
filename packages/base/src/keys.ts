export function cacheKey(...parts: unknown[]) {
  return parts.join(':');
}
