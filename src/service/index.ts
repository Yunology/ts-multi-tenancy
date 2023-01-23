// src/service/index.ts
import { RuntimeTenant } from '../entry';
import {
  extractRuntimeTenantConfig,
  injectPermissionToRuntimeTenant,
} from '../helper';

export type ConfigTree = Record<symbol, any>;

export abstract class Service {
  protected tenant!: RuntimeTenant;

  async init(tenant: RuntimeTenant): Promise<Service> {
    if (this.tenant !== undefined) {
      throw new Error('Service is inited with tenant.');
    }
    this.tenant = tenant;
    injectPermissionToRuntimeTenant(this.constructor, this.tenant);
    return this;
  }

  get getTenant(): RuntimeTenant {
    return this.tenant;
  }

  get config(): <C extends ConfigTree>() => C {
    return <C extends ConfigTree>() => extractRuntimeTenantConfig<C>(this.constructor, this.tenant);
  }
}

export * from './data_service';
export * from './database';
export * from './tenant';
