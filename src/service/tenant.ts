// src/service/tenant.ts
import { EntityManager } from 'typeorm';
import { isUndefined, cloneDeep } from 'lodash';

import { Service } from './service';
import { Tenant, RuntimeTenant, Database } from '../entry';
import { CreateTenantDTO, CreateDatabaseDTO } from '../dto';
import { DatabaseInfrastructure, TenantInfrastructure } from '../infrastructure';
import { createDataSource, getSystemDataSource } from '../datasource';
import { getPlan } from '..';

export class TenantService {
  private loadedModules: Record<string, Service> = {};
  private databases: Record<string, Database> = {};
  private runtimeTenants: Record<string, RuntimeTenant> = {};

  async initModules(
    callback: () => Promise<Record<string, Service>>,
  ): Promise<void> {
    this.loadedModules = await callback();
  }

  async initDatabases(manager: EntityManager): Promise<void> {
    const dbs = await manager.getRepository(Database).find();
    for (const db of dbs) {
      createDataSource(db.name, 'public', { url: db.url });
      this.databases[db.id] = db;
    }
  }

  async precreateTenantries(manager: EntityManager): Promise<void> {
    const tenants = await manager.getRepository(Tenant).find({
      where: {},
      relations: { database: true },
    });
    for (const tenant of tenants) {
      const runtimeTenant = await this.precreateTenant(tenant);
      this.runtimeTenants[tenant.id] = runtimeTenant;
    }
  }

  async initlializeTenantries(): Promise<void> {
    for (const tenant of Object.values(this.runtimeTenants)) {
      await tenant.moduleInitlialize();
    }
  }

  async precreateTenant(tenant: Tenant): Promise<RuntimeTenant> {
    const {
      id, name, orgName, activate, database, config,
    } = tenant;
    const { plan } = tenant;
    const { schemaName, modulesName } = plan;
    const modules = Object.assign(
      {},
      ...modulesName.map((name) => ({
        [name]: cloneDeep(this.loadedModules[name]),
      })),
    );
    const rt = new RuntimeTenant(
      id, name, orgName, activate, config, plan, modules,
    );
    if (activate) {
      await rt.precreateSchema(database, schemaName);
      await rt.precreateDataSource(database);
    }
    return rt;
  }

  async newDatabase(dto: CreateDatabaseDTO): Promise<Database> {
    const ds = getSystemDataSource();
    const cb = async (m: EntityManager): Promise<Database> => {
      const { name: dtoName, url: dtoUrl } = dto;
      const database = await DatabaseInfrastructure.getInstance().insert(
        m, dtoName, dtoUrl,
      );
      const { id, name, url } = database;
      createDataSource(name, 'public', { url });
      this.databases[id] = database;
      return database;
    };
    return ds.manager.transaction('SERIALIZABLE', cb);
  }

  async listDatabases(): Promise<Array<Database>> {
    return Object.values(this.databases);
  }

  get(tenantName: string | undefined): RuntimeTenant | undefined {
    return isUndefined(tenantName)
      ? undefined
      : Object
        .values(this.runtimeTenants)
        .find(({ identityName }) => identityName === tenantName);
  }

  async new(dto: CreateTenantDTO): Promise<RuntimeTenant> {
    const ds = getSystemDataSource();
    const cb = async (m: EntityManager): Promise<RuntimeTenant> => {
      const {
        name, orgName, activate, database: dbId, config, plan: planString,
      } = dto;
      const plan = getPlan(planString);
      const database = this.databases[dbId];
      const tenant = await TenantInfrastructure.getInstance().insert(
        m, name, orgName, activate, database, config, plan,
      );
      const runtimeTenant = await this.precreateTenant(tenant);
      this.runtimeTenants[tenant.id] = runtimeTenant;
      return runtimeTenant;
    };
    return ds.manager.transaction('SERIALIZABLE', cb);
  }

  async listTenantries(): Promise<Array<Tenant>> {
    const ds = getSystemDataSource();
    const cb = async (
      m: EntityManager,
    ): Promise<Array<Tenant>> => TenantInfrastructure.getInstance()
      .getTenantries(m);
    return ds.manager.transaction('SERIALIZABLE', cb);
  }
}
