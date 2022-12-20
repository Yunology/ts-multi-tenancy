// src/service/data_service.ts
import { EntityManager } from 'typeorm';

import { ConfigTree, PermissionTree, Service } from './service';

export abstract class DataService<
  P extends PermissionTree = {},
  C extends ConfigTree = {},
> extends Service<P, C> {
  serialTran<T>(
    runInTransaction: (manager: EntityManager) => Promise<T>,
  ): Promise<T> {
    return this.tenant.ds.manager.transaction(
      'SERIALIZABLE',
      runInTransaction,
    );
  }
}
