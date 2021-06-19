export function cacheKey(...parts: unknown[]) {
  return parts.join(':');
}

export function decodeCackeKey(key: string) {
  return key.split(':');
}
