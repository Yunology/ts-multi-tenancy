// test/integrate/hook.spec.ts
import { config } from 'dotenv';
import { use as chaiUse, should as chaiShould } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { LoggerOptions } from 'typeorm';

import {
  createSystemDataSource,
  initInfrastructures,
  initPlans,
  initMultiTenancy,
  TenantPlanInfo,
  getPlan,
  Database,
  Tenant,
} from 'index';

import TestConnection from '../test_connection';
import { systemDb, tenant } from '../test_data';
import { AService } from '../a_service';
import { BService } from '../b_service';

chaiUse(chaiAsPromised);
chaiShould();

export const conn = new TestConnection();
export const mochaHooks = {
  async beforeAll(): Promise<void> {
    config({ path: `.env.${process.env.ENV_NAME || 'test'}` });
    const { env } = process;
    const { DB_URL, DB_DROP_SCHEMA, DB_MIGRATIONS_RUN, DB_LOGGING } = env;

    createSystemDataSource(
      DB_URL!,
      DB_DROP_SCHEMA! === 'true',
      DB_MIGRATIONS_RUN! === 'true',
      DB_LOGGING! as LoggerOptions,
    );

    initPlans(() => ({
      [conn.getPlanName]: new TenantPlanInfo(
        conn.getPlanName,
        [AService, BService],
        [Tenant, Database],
        [],
      ),
    }));
    await initInfrastructures(() => Promise.resolve());
    await initMultiTenancy(
      async () => ({
        [AService.name]: new AService(),
        [BService.name]: new BService(),
      }),
      async (systemManager) => {
        systemDb.url = DB_URL!;
        tenant.plan = getPlan(conn.getPlanName);
        await systemManager.getRepository(Database).save(systemDb);
        await systemManager.getRepository(Tenant).save(tenant);
      },
      () => Promise.resolve(),
      'X-TEST-TENANT-HEADER',
      DB_LOGGING as LoggerOptions,
    );
  },
};
