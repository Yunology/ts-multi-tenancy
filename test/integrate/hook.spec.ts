// test/integrate/hook.spec.ts
import { config } from 'dotenv';
import { use as chaiUse, should as chaiShould } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { EntityManager, LoggerOptions } from 'typeorm';

import {
  createSystemDataSource, initInfrastructures, initMultiTenancy, initPlans,
  TenantPlanInfo,
} from 'index';

chaiUse(chaiAsPromised);
chaiShould();

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
      'TEST-PLAN': new TenantPlanInfo('standard', [], [], []),
    }));
    await initInfrastructures(async () => {});
    await initMultiTenancy(
      'X-TEST-TENANT-HEADER',
      async () => ({}),
      async (manager: EntityManager) => {},
    );
  },
};
