// src/index.ts
import { EntityManager } from 'typeorm';

import { Service, TenantService } from './service';
import {
  initRedisDataSource, initSessionRedisStore, getSystemDataSource,
} from './datasource';
import {
  DatabaseInfrastructure, TenantInfrastructure,
} from './infrastructure';
import { TenantPlanInfo } from './entry';

let planLoadedFlag = false;
let tenantService: TenantService;
let loadedPlans: Record<string, TenantPlanInfo> = {};

export * from './dto';
export * from './entry';
export * from './infrastructure';
export * from './service';
export * from './datasource';

export function initPlans(
  callback: () => Record<string, TenantPlanInfo>,
): void {
  loadedPlans = callback();
  planLoadedFlag = true;
}

export async function initMultiTenancy(
  initInfrastructureCallback: () =>  void,
  initModuleCallback: () => Promise<Record<string, Service>>,
  preCreateSystemDatasFunction?: (manager: EntityManager) => Promise<void>,
  preCreateTenantDatasFunction?: () => Promise<void>,
): Promise<void> {
  if (!planLoadedFlag || Object.values(loadedPlans).length === 0) {
    throw new Error(`Non of any plans loaded. please invoke initPlans first.`);
  }

  tenantService = new TenantService();
  const redisDataSource = await initRedisDataSource();
  const sessionStore = await initSessionRedisStore();
  const systemDataSource = await getSystemDataSource().initialize();
  await systemDataSource.transaction('SERIALIZABLE', async (manager: EntityManager) => {
    await DatabaseInfrastructure.init();
    await TenantInfrastructure.init();
    await tenantService.initInfrastructures(initInfrastructureCallback);
    await tenantService.initModules(initModuleCallback);
    if (preCreateSystemDatasFunction !== undefined) {
      await preCreateSystemDatasFunction(manager);
    }
    await tenantService.initDatabases(manager);
    await tenantService.precreateTenantries(manager);
    if (preCreateTenantDatasFunction !== undefined) {
      await preCreateTenantDatasFunction();
    }
    await tenantService.initlializeTenantries();
  });
}

export function getTenantService(): TenantService {
  return tenantService;
}

export function getPlan(schemaName: string): TenantPlanInfo {
  const plan = loadedPlans[schemaName];
  if (plan === undefined) {
    throw new Error(`Plan with given schemaName not exists: ${schemaName}`);
  }
  return plan;
}
