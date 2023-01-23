// src/service/index.ts
import { Permission, RuntimeTenant } from '../entry';

export type ConfigTree = Record<symbol, any>;
export type PermissionTree = Record<string, Permission>;

export abstract class Service<P extends PermissionTree = {}> {
  protected tenant!: RuntimeTenant;
  public readonly permission!: P;

  constructor(permission: P = {} as P) {
    this.permission = permission;
  }

  async init(tenant: RuntimeTenant): Promise<Service<P>> {
    if (this.tenant !== undefined) {
      throw new Error('Service is inited with tenant.');
    }
    this.tenant = tenant;
    this.tenant.insertPermission(this.permission);
    return this;
  }

  get getTenant(): RuntimeTenant {
    return this.tenant;
  }
}

export * from './data_service';
export * from './database';
export * from './tenant';
