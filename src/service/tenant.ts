// src/service/tenant.ts
import { EntityManager } from 'typeorm';
import { Request } from 'express';
import cloneDeep from 'lodash/cloneDeep';
import isUndefined from 'lodash/isUndefined';

import { Tenant, RuntimeTenant } from '../entry';
import { CreateTenantDTO } from '../dto';
import { TenantInfrastructure } from '../infrastructure';
import { getSystemDataSource } from '../datasource';
import { getDatabaseService, getPlan } from '..';

import { Service } from '.';

export class TenantService {
  private headerName = 'X-TENANT-ID';
  private loadedModules: Record<string, Service> = {};
  private runtimeTenants: Record<string, RuntimeTenant> = {};

  constructor(headerName?: string) {
    this.headerName = headerName || this.headerName;
  }

  get tenantHeaderName(): string {
    return this.headerName;
  }

  async initModules(
    callback: () => Promise<Record<string, Service>>,
  ): Promise<void> {
    this.loadedModules = await callback();
  }

  async precreateTenantries(manager: EntityManager): Promise<void> {
    const tenants = await manager.getRepository(Tenant).find({ where: {} });
    for (const tenant of tenants) {
      const runtimeTenant = await this.precreateTenant(tenant);
      this.runtimeTenants[tenant.id] = runtimeTenant;
    }
  }

  async initlializeTenantries(): Promise<void> {
    for (const tenant of Object.values(this.runtimeTenants)) {
      await tenant.moduleInitlialize();
      await tenant.configInitlialize();
    }
  }

  async precreateTenant(tenant: Tenant): Promise<RuntimeTenant> {
    const { id, name, orgName, activate, config } = tenant;
    const { plan } = tenant;
    const { schemaName, modulesName } = plan;
    const modules = Object.assign(
      {},
      ...modulesName.map((eachModuleName) => ({
        [eachModuleName]: cloneDeep(this.loadedModules[eachModuleName]),
      })),
    );
    const rt = new RuntimeTenant(
      id,
      name,
      orgName,
      activate,
      config,
      plan,
      modules,
    );
    if (activate) {
      await getDatabaseService().precreateRuntimeTenantProperties(
        rt, config, schemaName,
      );
    }
    return rt;
  }

  get(tenantName: string | undefined): RuntimeTenant | undefined {
    return isUndefined(tenantName)
      ? undefined
      : Object.values(this.runtimeTenants).find(
          ({ identityName }) => identityName === tenantName,
        );
  }

  async new(dto: CreateTenantDTO): Promise<RuntimeTenant> {
    const ds = getSystemDataSource();
    const cb = async (m: EntityManager): Promise<RuntimeTenant> => {
      const {
        name,
        orgName,
        activate,
        config,
        plan: planString,
      } = dto;
      const plan = getPlan(planString);
      const tenant = await TenantInfrastructure.getInstance().insert(
        m,
        name,
        orgName,
        activate,
        config,
        plan,
      );
      const runtimeTenant = await this.precreateTenant(tenant);
      await runtimeTenant.moduleInitlialize();
      await runtimeTenant.configInitlialize();
      this.runtimeTenants[tenant.id] = runtimeTenant;
      return runtimeTenant;
    };
    return ds.manager.transaction('SERIALIZABLE', cb);
  }

  async listTenantries(): Promise<Array<Tenant>> {
    const ds = getSystemDataSource();
    const cb = async (m: EntityManager): Promise<Array<Tenant>> =>
      TenantInfrastructure.getInstance().getTenantries(m);
    return ds.manager.transaction('SERIALIZABLE', cb);
  }

  async getTenant(id: string): Promise<Tenant> {
    const ds = getSystemDataSource();
    const cb = async (m: EntityManager): Promise<Tenant> =>
      TenantInfrastructure.getInstance().getById(m, id);
    return ds.manager.transaction('SERIALIZABLE', cb);
  }

  getTenantByHeaderFromReqeust(req: Request): RuntimeTenant | undefined {
    const tenantName = req.header(this.headerName);
    return isUndefined(tenantName) ? undefined : this.get(tenantName);
  }
}
