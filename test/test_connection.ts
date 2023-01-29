// test/test_connection.ts
import { DataSource, EntityManager } from 'typeorm';

import {
  getDataSource,
  RuntimeTenant,
  Service,
  getTenantService,
} from 'index';
import { tenant } from './test_data';

export default class TestConnection {
  get getPlanName(): string {
    return 'TESTPLAN';
  }

  get getTenantName(): string {
    return `${tenant.orgName}-${tenant.name}`;
  }

  get getDs(): DataSource {
    return getDataSource(this.getTenantName, this.getPlanName)!;
  }

  getTenant(): RuntimeTenant {
    return getTenantService().getTenantByInfo(this.getTenantName)!;
  }

  getModule<T extends Service>(t: (new (...args: any[]) => T) | string): T {
    return this.getTenant().service(t);
  }

  async autoRollbackSerialTran<T>(
    runInTransaction: (manager: EntityManager) => Promise<T>,
  ): Promise<void> {
    const qr = this.getDs.createQueryRunner();
    await qr.connect();
    await qr.startTransaction('SERIALIZABLE');

    try {
      await runInTransaction(qr.manager);
    } finally {
      await qr.rollbackTransaction();
      await qr.release();
    }
  }

  async destroy(): Promise<void> {
    await this.getDs.destroy();
  }

  async clear(): Promise<void> {
    const entities = this.getDs.entityMetadatas;

    entities.forEach(async (entity) => {
      const repository = this.getDs.getRepository(entity.name);
      await repository.query(`DELETE FROM ${entity.tableName}`);
    });
  }
}
