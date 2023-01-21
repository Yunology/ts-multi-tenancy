// src/datasoruce.ts
import { DataSource, LoggerOptions } from 'typeorm';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';
import { createClient, RedisClientType } from 'redis';

// Tenant entitires & migrations
import { Tenant, Database } from './entry';
import {
  TenantInit1668658417786,
  BaseEntityIdField1668675504073,
} from './migration';

const connectionPools: Record<string, DataSource> = {};
let redisDataSource: RedisClientType;

export function createDataSource(
  dbName: string,
  schema: string,
  options: Partial<PostgresConnectionOptions>,
): DataSource {
  if (`${dbName}.${schema}` in connectionPools) {
    return connectionPools[`${dbName}.${schema}`];
  }

  const ds = new DataSource({
    logging: ['error', 'warn'],
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
  logging?: LoggerOptions,
): DataSource {
  return createDataSource('system', 'public', {
    url,
    entities: [Tenant, Database],
    migrations: [TenantInit1668658417786, BaseEntityIdField1668675504073],
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

export async function initRedisDataSource(): Promise<RedisClientType> {
  if (redisDataSource !== undefined) {
    await redisDataSource.connect();
  }
  return redisDataSource;
}

export function getRedisDataSource(): RedisClientType {
  return redisDataSource;
}
