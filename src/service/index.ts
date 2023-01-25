// src/service/index.ts
import { RuntimeTenant } from '../runtime';
import {
  ConfigTree,
  extractRuntimeTenantConfig,
  injectPermissionToRuntimeTenant,
} from '../helper';

export abstract class Service {
  async init(runtimeTenant: RuntimeTenant): Promise<Service> {
    injectPermissionToRuntimeTenant(this.constructor, runtimeTenant);
    return this;
  }

  config<C extends ConfigTree>(rt: RuntimeTenant): C {
    return extractRuntimeTenantConfig<C>(this.constructor, rt);
  }
}

export * from './data_service';
export * from './database';
export * from './runtime_service';
export * from './tenant';
