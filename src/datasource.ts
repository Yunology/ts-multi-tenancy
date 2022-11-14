// src/datasoruce.ts
import { DataSource, LoggerOptions } from 'typeorm';
import {
  PostgresConnectionOptions,
} from 'typeorm/driver/postgres/PostgresConnectionOptions';
import { createClient, RedisClientType } from 'redis';
import session from 'express-session';
import connectRedis, { RedisStore } from 'connect-redis';

// Tenant entitires & migrations
import { Tenant, Database } from '@/entry';
import {
  TenantInit1666672671893, TenantTableConfigField1666798005898,
  TenantTablePlanField1667030240831, TenantTableDatabaseUrlField1667050447866,
  TenantTableDatabaseField1667111877341,
} from '@/migration';

const RedisStore = connectRedis(session);

const connectionPools: Record<string, DataSource> = {};
let redisDataSource: RedisClientType;
let sessionStore: RedisStore;
let sessionRedis: RedisClientType;

export function createDataSource(
  dbName: string,
  schema: string,
  options: Partial<PostgresConnectionOptions>,
): DataSource {
  if (`${dbName}.${schema}` in connectionPools) {
    return connectionPools[`${dbName}.${schema}`];
  }

  const ds = new DataSource({
    ...options,
    type: 'postgres',
    schema,
  });
  connectionPools[`${dbName}.${schema}`] = ds;
  return ds;
}

export function createSystemDataSource(
  url: string,
  dropSchema = false,
  migrationsRun = false,
  logging: LoggerOptions = false,
): DataSource {
  return createDataSource('system', 'public', {
    url,
    entities: [Tenant, Database],
    migrations: [
      TenantInit1666672671893, TenantTableConfigField1666798005898,
      TenantTablePlanField1667030240831,
      TenantTableDatabaseUrlField1667050447866,
      TenantTableDatabaseField1667111877341,
    ],
    dropSchema,
    migrationsRun,
    logging,
    extra: {
      charset: 'utf8_unicode_ci',
    },
  });
}

export function getDataSource(
  dbName: string,
  schemaName = 'public',
): DataSource | undefined {
  return connectionPools[`${dbName}.${schemaName}`];
}

export function getSystemDataSource(): DataSource {
  const ds = getDataSource('system');
  if (ds === undefined) {
    throw new Error('System DataSource is not create yet.');
  }
  return ds;
}

export function createRedisDataSource(url: string): RedisClientType {
  if (redisDataSource !== undefined) {
    throw new Error('RedisDataSource is already created.');
  }

  redisDataSource = createClient({ url });
  return redisDataSource;
}

export function createSessionRedisStore(url: string): RedisClientType {
  if (sessionRedis !== undefined) {
    throw new Error('SessionRedis is already created.');
  }

  sessionRedis = createClient({ url, legacyMode: true });
  sessionStore = new RedisStore({ client: sessionRedis });
  return sessionRedis;
}

export async function initRedisDataSource(): Promise<RedisClientType> {
  if (redisDataSource !== undefined) {
    await redisDataSource.connect();
  }
  return redisDataSource;
}

export async function initSessionRedisStore(): Promise<RedisStore> {
  if (sessionRedis !== undefined) {
    await sessionRedis.connect();
  }
  return sessionStore;
}

export function getRedisDataSource(): RedisClientType {
  return redisDataSource;
}

export function getSessionRedisStore(): RedisStore {
  return sessionStore;
}
