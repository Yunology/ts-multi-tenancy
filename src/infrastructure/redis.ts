// src/infrastructure/redis.ts
import { getRedisDataSource } from 'datasource';

export class RedisCache {
  private prefix: string;
  private ttl: number;

  constructor(prefix: string, ttl = -1) {
    this.prefix = prefix;
    this.ttl = ttl;
  }

  async get<T>(key: string): Promise<T | null> {
    const cli = getRedisDataSource();
    if (cli === undefined || !cli.isOpen || !cli.isReady) {
      return null;
    }

    const result = await cli.get(`${this.prefix}:${key}`);
    return result === null ? null : JSON.parse(result);
  }

  async set<T>(key: string, data: T): Promise<void> {
    const cli = getRedisDataSource();
    if (cli === undefined || !cli.isOpen || !cli.isReady) {
      return;
    }

    await cli.set(`${this.prefix}:${key}`, JSON.stringify(data), this.ttl !== -1
      ? { EX: this.ttl }
      : undefined,
    );
    if (this.ttl === -1) {
      await cli.persist(`${this.prefix}:${key}`);
    }
  }

  async sadd(key: string, data: string): Promise<void> {
    const cli = getRedisDataSource();
    if (cli === undefined || !cli.isOpen || !cli.isReady) {
      return;
    }

    await cli.sAdd(`${this.prefix}:${key}`, JSON.stringify(data));
  }

  async srem(key: string, data: string): Promise<void> {
    const cli = getRedisDataSource();
    if (cli === undefined || !cli.isOpen || !cli.isReady) {
      return;
    }

    await cli.sRem(`${this.prefix}:${key}`, data);
  }

  async smembers(key: string): Promise<Array<string>> {
    const cli = getRedisDataSource();
    if (cli === undefined || !cli.isOpen || !cli.isReady) {
      return [];
    }

    return cli.sMembers(`${this.prefix}:${key}`);
  }

  async isExists(key: string): Promise<boolean> {
    const cli = getRedisDataSource();
    if (cli === undefined || !cli.isOpen || !cli.isReady) {
      return false;
    }

    const result = await cli.exists(`${this.prefix}:${key}`);
    return result === 1;
  }

  async unlink(key: string): Promise<void> {
    const cli = getRedisDataSource();
    if (cli === undefined || !cli.isOpen || !cli.isReady) {
      return;
    }

    // UNLINK: non-block version of delete
    await cli.unlink(`${this.prefix}:${key}`);
  }
}
