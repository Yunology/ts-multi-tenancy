// src/service/data_service.ts
import { EntityManager } from 'typeorm';

import { RuntimeTenant } from '../entry'

import { Service } from '.';

export abstract class DataService extends Service {
  serialTran<T>(
    runtimeTenant: RuntimeTenant,
    runInTransaction: (manager: EntityManager) => Promise<T>,
  ): Promise<T> {
    return runtimeTenant.ds.manager.transaction(
      'SERIALIZABLE',
      runInTransaction,
    );
  }
}
