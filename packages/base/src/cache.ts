export class Cache<T> {
  private cache: T | null = null;

  private lastUpdatedAt = 0;

  private deferreds: { resolve: (value: T) => void; reject: (reason?: any) => void }[] = [];

  private getting = false;

  constructor(private getter: () => Promise<T>, public ttl: number) {}

  async get(force = false) {
    if (!force && this.cache && Date.now() < this.lastUpdatedAt + this.ttl) return this.cache;
    if (this.getting) return new Promise<T>((resolve, reject) => this.deferreds.push({ resolve, reject }));
    this.getting = true;
    try {
      this.cache = await this.getter();
      this.lastUpdatedAt = Date.now();
      this.deferreds.forEach(deferred => deferred.resolve(this.cache as T));
      return this.cache;
    } catch (error) {
      this.deferreds.forEach(deferred => deferred.reject(error));
      throw error;
    } finally {
      this.getting = false;
      this.deferreds = [];
    }
  }

  clear() {
    this.cache = null;
    this.lastUpdatedAt = 0;
  }

  async update() {
    this.clear();
    await this.get();
  }
}
