// src/service/database.ts
import { DataSource, EntityManager, LoggerOptions } from 'typeorm';

import { CreateDatabaseDTO } from '../dto';
import { ConfigTree } from '../helper';
import { Database } from '../entry';
import { DatabaseInfrastructure } from '../infrastructure';
import { createDataSource, getDataSource, getSystemDataSource } from '../datasource';
import { RuntimeTenant } from '../runtime';

import { Service } from '.';

export interface IDatabaseConfig extends ConfigTree {
  database: string;
}

export class DatabaseService extends Service {
  private dbLogging: LoggerOptions | undefined;
  private databases: Record<string, Database> = {};

  constructor(dbLogging?: LoggerOptions) {
    super();
    this.dbLogging = dbLogging;
  }

  async precreateTenantSchema(
    { name, url }: Database,
    schema: string,
    logging?: LoggerOptions,
  ) {
    let systemDb: DataSource | undefined = getDataSource(name);
    if (systemDb === undefined) {
      systemDb = createDataSource(name, 'public', { url, logging });
    }

    if (!systemDb.isInitialized) {
      await systemDb.initialize();
    }
    await systemDb.manager.query(`CREATE SCHEMA IF NOT EXISTS ${schema}`);
    await systemDb.destroy();
  }

  async precreateTenantDataSource(
    rt: RuntimeTenant,
    { name, url }: Database,
    logging?: LoggerOptions,
  ) {
    const plan = rt.getPlan;
    const { schemaName, entries, migrations } = plan;

    const dataSource = createDataSource(name, schemaName, {
      url,
      entities: entries,
      migrations,
      logging,
    });
    if (!dataSource.isInitialized) {
      await dataSource.initialize();
    }
    rt.setupDataSource(dataSource);
  }

  async precreateRuntimeTenantProperties(
    rt: RuntimeTenant,
    schemaName: string,
  ): Promise<void> {
    const database =
      this.databases[this.config<IDatabaseConfig>(rt).database];
    await this.precreateTenantSchema(
      database, schemaName, this.dbLogging,
    );
    await this.precreateTenantDataSource(
      rt, database, this.dbLogging,
    );
  }

  async initDatabases(manager: EntityManager): Promise<void> {
    const dbs = await manager.getRepository(Database).find();
    for (const db of dbs) {
      createDataSource(db.name, 'public', {
        url: db.url,
        logging: this.dbLogging,
      });
      this.databases[db.id] = db;
    }
  }

  async new(dto: CreateDatabaseDTO): Promise<Database> {
    const ds = getSystemDataSource();
    const cb = async (m: EntityManager): Promise<Database> => {
      const { name: dtoName, url: dtoUrl } = dto;
      const database = await DatabaseInfrastructure.getInstance().insert(
        m,
        dtoName,
        dtoUrl,
      );
      const { id, name, url } = database;
      createDataSource(name, 'public', { url, logging: this.dbLogging });
      this.databases[id] = database;
      return database;
    };
    return ds.manager.transaction('SERIALIZABLE', cb);
  }

  getDatabases(): Array<Database> {
    return Object.values(this.databases);
  }

  getById(id: string): Database {
    return this.databases[id];
  }
}
