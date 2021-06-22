export async function retry<T>(fn: () => Promise<T> | T, maxAttempt: number) {
  let lastError: unknown;
  for (let i = 0; i < maxAttempt; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError;
}
