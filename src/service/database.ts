// src/service/database.ts
import { EntityManager, LoggerOptions } from 'typeorm';

import { CreateDatabaseDTO } from '../dto';
import { Database, RuntimeTenant } from '../entry';
import { DatabaseInfrastructure } from '../infrastructure';
import { ProvideConfig, HelperParameter } from '../helper';
import { createDataSource, getSystemDataSource } from '../datasource';

import { ConfigTree, Service } from './service';

export interface IDatabaseConfig extends ConfigTree {
  database: string;
};

export class DatabaseService extends Service {
  private dbLogging: LoggerOptions | undefined;
  private databases: Record<string, Database> = {};

  constructor(dbLogging?: LoggerOptions) {
    super();
    this.dbLogging = dbLogging;
  }

  @ProvideConfig<IDatabaseConfig>(['database'])
  async precreateRuntimeTenantProperties(
    params: HelperParameter<IDatabaseConfig>,
    rt: RuntimeTenant,
    schemaName: string,
  ): Promise<void> {
    const database = this.databases[params.configs!.database];
    await rt.precreateSchema(database, schemaName, this.dbLogging);
    await rt.precreateDataSource(database, this.dbLogging);
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
