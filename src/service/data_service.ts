// src/service/data_service.ts
import { EntityManager } from 'typeorm';

import { ConfigTree, Service } from './service';

export abstract class DataService<C extends ConfigTree = {}> extends Service<C> {
  serialTran<T>(
    runInTransaction: (manager: EntityManager) => Promise<T>,
  ): Promise<T> {
    return this.tenant.ds.manager.transaction(
      'SERIALIZABLE',
      runInTransaction,
    );
  }
}
