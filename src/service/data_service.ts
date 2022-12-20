// src/service/data_service.ts
import { EntityManager } from 'typeorm';

import { ConfigTree, Service } from './service';

export abstract class DataService<S extends ConfigTree = {}> extends Service<S> {
  serialTran<T>(
    runInTransaction: (manager: EntityManager) => Promise<T>,
  ): Promise<T> {
    return this.tenant.ds.manager.transaction(
      'SERIALIZABLE',
      runInTransaction,
    );
  }
}
