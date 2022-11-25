// test/integrate/hook.spec.ts
import { config } from 'dotenv';
import { use as chaiUse, should as chaiShould } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { EntityManager, LoggerOptions } from 'typeorm';

import {
  getSystemDataSource, createSystemDataSource, initInfrastructures, initPlans,
  initMultiTenancy, TenantPlanInfo,
} from 'index';

chaiUse(chaiAsPromised);
chaiShould();

export async function autoRollbackTransaction(
  runInTransaction: (manager: EntityManager) => Promise<void>,
): Promise<void> {
  const qr = getSystemDataSource().createQueryRunner();
  await qr.connect();
  await qr.startTransaction('SERIALIZABLE');

  try {
    await runInTransaction(qr.manager);
  } finally {
    await qr.rollbackTransaction();
    await qr.release();
  }
}

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
      'TEST-PLAN': new TenantPlanInfo('TEST-PLAN', [], [], []),
    }));
    await initInfrastructures(async () => {});
    await initMultiTenancy(
      async () => ({}),
      async (manager: EntityManager) => {},
      undefined,
      'X-TEST-TENANT-HEADER',
      DB_LOGGING as LoggerOptions,
    );
  },
};
