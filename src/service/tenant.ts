// src/service/tenant.ts
import { EntityManager } from 'typeorm';
import { isUndefined, cloneDeep } from 'lodash';

import { Service } from './service';
import {
  Tenant, TenantPlanInfo, RuntimeTenant, Database,
} from '../entry';
import { CreateTenantDTO, CreateDatabaseDTO } from '../dto';
import { DatabaseInfrastructure, TenantInfrastructure } from '../infrastructure';
import { createDataSource, getSystemDataSource } from '../datasource';
export class TenantService {
  private loadedModules: Record<string, Service> = {};
  private databases: Record<string, Database> = {};
  private runtimeTenants: Record<string, RuntimeTenant> = {};

  async initInfrastructures(callback: () =>  void): Promise<void> {
    callback();
  }

  async initModules(callback: (loadedModules: Record<string, Service>) => void): Promise<void> {
    callback(this.loadedModules);
  }

  async initDatabases(manager: EntityManager): Promise<void> {
    const dbs = await manager.getRepository(Database).find();
    for (const db of dbs) {
      createDataSource(db.name, 'public', { url: db.url });
      this.databases[db.name] = db;
    }
  }

  async precreateTenantries(manager: EntityManager): Promise<void> {
    const tenants = await manager.getRepository(Tenant).find({
      where: {},
      relations: { database: true },
    });
    for (const tenant of tenants) {
      const runtimeTenant = await this.precreateTenant(tenant);
      this.runtimeTenants[runtimeTenant.identityName] = runtimeTenant;
    }
  }

  async initlializeTenantries(): Promise<void> {
    for (const tenant of Object.values(this.runtimeTenants)) {
      await tenant.moduleInitlialize();
    }
  }

  async precreateTenant(tenant: Tenant): Promise<RuntimeTenant> {
    const { activate, database } = tenant;
    const { plan: tenantPlan } = tenant;

    const plan = TenantPlanInfo.fromName(tenantPlan);
    const { schemaName, modulesName } = plan;
    const modules = Object.assign(
      {},
      ...modulesName.map((name) => ({
        [name]: cloneDeep(this.loadedModules[name]),
      })),
    );
    const rt = new RuntimeTenant(tenant, plan, modules);
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
      const { name, url } = database;
      createDataSource(name, 'public', { url });
      this.databases[name] = database;
      return database;
    };
    return ds.manager.transaction('SERIALIZABLE', cb);
  }

  async listDatabases(): Promise<Array<Database>> {
    return Object.values(this.databases);
  }

  get(tenantId: string | undefined): RuntimeTenant | undefined {
    return isUndefined(tenantId) ? undefined : this.runtimeTenants[tenantId];
  }

  async new(dto: CreateTenantDTO): Promise<RuntimeTenant> {
    const ds = getSystemDataSource();
    const cb = async (m: EntityManager): Promise<RuntimeTenant> => {
      const {
        name, orgName, activate, database: dbName, config, plan,
      } = dto;
      const database = this.databases[dbName];
      const tenant = await TenantInfrastructure.getInstance().insert(
        m, name, orgName, activate, database, config, plan,
      );
      const runtimeTenant = await this.precreateTenant(tenant);
      this.runtimeTenants[runtimeTenant.identityName] = runtimeTenant;
      return runtimeTenant;
    };
    return ds.manager.transaction('SERIALIZABLE', cb);
  }

  async listTenantries(): Promise<Array<Tenant>> {
    return Object
      .values(this.runtimeTenants)
      .map(({ getTenant }) => getTenant);
  }
}
