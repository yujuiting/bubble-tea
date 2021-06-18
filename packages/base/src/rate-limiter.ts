export function rateLimiter<T extends (...args: any[]) => Promise<any>>(call: T, limitCount: number, interval = 1000) {
  let count = 0;
  let timer: NodeJS.Timer | null = null;
  let deferreds: (() => void)[] = [];

  async function beforeCall() {
    if (count >= limitCount) await defer();

    if (!timer) setupTimer();

    count += 1;
  }

  async function defer() {
    await new Promise<void>(resolve => deferreds.push(resolve));
  }

  function resolveDeferreds() {
    let deferred = deferreds.shift();
    let resolveCount = 0;
    while (deferred && resolveCount < limitCount) {
      deferred();
      resolveCount += 1;
    }
  }

  function setupTimer() {
    timer = setTimeout(() => {
      count = 0;
      timer = null;
      resolveDeferreds();
    }, interval);
  }

  return async <U = ReturnType<T>>(...args: Parameters<T>): Promise<UnpackPromise<U>> => {
    await beforeCall();
    return await call(...args);
  };
}

type UnpackPromise<T> = T extends Promise<infer U> ? U : T;
