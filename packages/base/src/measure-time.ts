export async function measureTime<T>(fn: () => Promise<T>, callback?: (diff: number) => void) {
  const start = process.hrtime.bigint();
  try {
    return await fn();
  } finally {
    const end = process.hrtime.bigint();
    if (callback) callback(Number(end - start) * 10e-7);
  }
}
