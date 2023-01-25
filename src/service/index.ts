// src/service/index.ts
import { RuntimeTenant } from '../entry';
import {
  ConfigTree,
  extractRuntimeTenantConfig,
  injectPermissionToRuntimeTenant,
} from '../helper';

export abstract class Service {
  async init(runtimeTenant: RuntimeTenant): Promise<Service> {
    /* TODO: check init status in RuntimeTenant
    if (this.tenant !== undefined) {
      throw new Error('Service is inited with tenant.');
    }
    */
    injectPermissionToRuntimeTenant(this.constructor, runtimeTenant);
    return this;
  }

  config<C extends ConfigTree>(rt: RuntimeTenant): C {
    return extractRuntimeTenantConfig<C>(this.constructor, rt);
  }
}

export * from './data_service';
export * from './database';
export * from './tenant';
