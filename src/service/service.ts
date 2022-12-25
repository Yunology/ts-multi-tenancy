// src/service/service.ts
import { Permission, RuntimeTenant } from '../entry';

export type ConfigTree = Record<string | symbol, any>;
export type PermissionTree = Record<string, Permission>;

export abstract class Service<
  P extends PermissionTree = {},
  C extends ConfigTree = {},
> {
  protected tenant!: RuntimeTenant;
  public readonly permission!: P;
  protected config!: C;

  constructor(permission: P = {} as P, config: C = {} as C) {
    this.permission = permission;
    this.config = config;
  }

  async init(tenant: RuntimeTenant): Promise<Service<P, C>> {
    if (this.tenant !== undefined) {
      throw new Error('Service is inited with tenant.');
    }
    this.tenant = tenant;
    this.tenant.insertPermission(this.permission);

    Object.keys(this.config).forEach((key: keyof C) => {
      this.config[key] = this.tenant.getConfig<C[typeof key]>(
        key as string, this.config[key],
      );
    });

    return this;
  }

  get getTenant(): RuntimeTenant {
    return this.tenant;
  }
}
