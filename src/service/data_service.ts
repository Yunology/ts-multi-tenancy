// src/service/data_service.ts
import { EntityManager } from 'typeorm';

import { PermissionTree, Service } from '.';

export abstract class DataService<
  P extends PermissionTree = {},
> extends Service<P> {
  serialTran<T>(
    runInTransaction: (manager: EntityManager) => Promise<T>,
  ): Promise<T> {
    return this.tenant.ds.manager.transaction(
      'SERIALIZABLE',
      runInTransaction,
    );
  }
}
