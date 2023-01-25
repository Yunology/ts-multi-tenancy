// src/index.ts
import 'reflect-metadata';
import { EntityManager, LoggerOptions } from 'typeorm';

import { Service, DatabaseService, TenantService } from './service';
import { initRedisDataSource, getSystemDataSource } from './datasource';
import {
  DatabaseInfrastructure,
  TenantInfrastructure,
} from './infrastructure';
import { TenantPlanInfo } from './entry';

let planLoadedFlag = false;
let infraLoadedFlag = false;
let databaseService: DatabaseService;
let tenantService: TenantService;
let loadedPlans: Record<string, TenantPlanInfo> = {};

export * from './dto';
export * from './entry';
export * from './helper';
export * from './infrastructure';
export * from './service';
export * from './runtime';

export * from './datasource';

export function initPlans(
  callback: () => Record<string, TenantPlanInfo>,
): void {
  loadedPlans = callback();
  planLoadedFlag = true;
}

export async function initInfrastructures(
  callback: () => Promise<void>,
): Promise<void> {
  if (infraLoadedFlag) {
    throw new Error('Infras were loaded before.');
  }
  await DatabaseInfrastructure.init();
  await TenantInfrastructure.init();
  await callback();
  infraLoadedFlag = true;
}

export async function initMultiTenancy(
  initModuleCallback: () => Promise<Record<string, Service>>,
  preCreateSystemDatasFunction?: (manager: EntityManager) => Promise<void>,
  preCreateTenantDatasFunction?: () => Promise<void>,
  tenantHaederName?: string,
  tenantDbLogging?: LoggerOptions,
): Promise<void> {
  if (!planLoadedFlag || Object.values(loadedPlans).length === 0) {
    throw new Error(
      'Non of any plans loaded. please invoke initPlans first.',
    );
  } else if (!infraLoadedFlag) {
    throw new Error(
      'Non of any infras loaded. please invoke initInfrastructures first.',
    );
  }

  databaseService = new DatabaseService(tenantDbLogging);
  tenantService = new TenantService(tenantHaederName);
  const redisDataSource = await initRedisDataSource();
  const systemDataSource = await getSystemDataSource().initialize();
  await systemDataSource.transaction(
    'SERIALIZABLE',
    async (manager: EntityManager) => {
      await tenantService.initModules(initModuleCallback);
      if (preCreateSystemDatasFunction !== undefined) {
        await preCreateSystemDatasFunction(manager);
      }
      await databaseService.initDatabases(manager);
      await tenantService.precreateTenantries(manager);
      if (preCreateTenantDatasFunction !== undefined) {
        await preCreateTenantDatasFunction();
      }
      await tenantService.initlializeTenantries();
    },
  );
}

export function getDatabaseService(): DatabaseService {
  return databaseService;
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
