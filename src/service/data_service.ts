// src/service/data_service.ts
import { EntityManager } from 'typeorm';

import { Service } from '.';

export abstract class DataService extends Service {
  serialTran<T>(
    runInTransaction: (manager: EntityManager) => Promise<T>,
  ): Promise<T> {
    return this.tenant.ds.manager.transaction(
      'SERIALIZABLE',
      runInTransaction,
    );
  }
}
