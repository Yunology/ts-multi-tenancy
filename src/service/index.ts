// src/service/index.ts
import { RuntimeTenant } from '../entry';
import {
  ConfigTree,
  extractRuntimeTenantConfig,
  injectPermissionToRuntimeTenant,
} from '../helper';

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

  config<C extends ConfigTree>(rt: RuntimeTenant): C {
    return extractRuntimeTenantConfig<C>(this.constructor, rt);
  }
}

export * from './data_service';
export * from './database';
export * from './tenant';
