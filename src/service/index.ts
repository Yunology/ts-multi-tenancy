// src/service/index.ts
import { RuntimeTenant } from '../runtime';
import {
  ConfigTree,
  extractRuntimeTenantConfig,
  injectPermissionToRuntimeTenant,
} from '../helper';

/**
 * Use to wrap the business logics.
 * This class is manage by TenantService including initialization.
 * If you want to initialize it, make sure what are you doing.
 *
 * Members in this class will share to all used Services.
 * Do not put any state members in here.
 */
export abstract class Service {
  /**
   * Use to inject permission into RuntimeTenant and some setup for Service.
   * Like some data pre-create.
   */
  async setupByTenant(runtimeTenant: RuntimeTenant): Promise<Service> {
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
