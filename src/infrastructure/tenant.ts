// src/infrastructure/tenant.ts
import { EntityManager } from 'typeorm';

import { Tenant, Config, TenantPlanInfo } from '../entry';

import { InfrastructureManyModifiable } from './infrastructure';

export class TenantInfrastructure extends InfrastructureManyModifiable<Tenant> {
  private static INSTANCE: TenantInfrastructure;

  public static async init(): Promise<TenantInfrastructure> {
    if (this.INSTANCE === undefined) {
      this.INSTANCE = new TenantInfrastructure();
    }

    return this.INSTANCE;
  }

  public static getInstance(): TenantInfrastructure {
    return this.INSTANCE;
  }

  constructor() {
    super(Tenant);
  }

  public async getById(manager: EntityManager, id: string): Promise<Tenant> {
    return this.get(manager, { id });
  }

  public async getTenantries(manager: EntityManager): Promise<Array<Tenant>> {
    return this.getMany(manager, {});
  }

  public async insert(
    manager: EntityManager,
    name: string,
    orgName: string,
    activate: boolean,
    config: Config,
    plan: TenantPlanInfo,
  ): Promise<Tenant> {
    const tenant = new Tenant();
    tenant.name = name;
    tenant.orgName = orgName;
    tenant.activate = activate;
    tenant.config = config;
    tenant.plan = plan;

    return this.add(manager, tenant, { name, orgName });
  }
}
