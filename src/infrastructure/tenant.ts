// src/infrastructure/tenant.ts
import { EntityManager } from 'typeorm';

import { InfrastructureManyModifiable } from './infrastructure';
import {
  Tenant, Config, Database, TenantPlanInfo,
} from '../entry';

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

  getManyByIds(manager: EntityManager, ids: Array<number>): Promise<Array<Tenant>> {
    throw new Error('Tenant can not get by ids.');
  }

  public async getTenantries(manager: EntityManager): Promise<Array<Tenant>> {
    return this.getMany(manager, {}, {
      relations: { database: true },
    });
  }

  public async insert(
    manager: EntityManager,
    name: string,
    orgName: string,
    activate: boolean,
    database: Database,
    config: Config,
    plan: TenantPlanInfo,
  ): Promise<Tenant> {
    const tenant = new Tenant();
    tenant.name = name;
    tenant.orgName = orgName;
    tenant.activate = activate;
    tenant.database = database;
    tenant.config = config;
    tenant.plan = plan;

    return this.add(manager, tenant, { name, orgName });
  }
}
