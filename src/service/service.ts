// src/service/service.ts
import { RuntimeTenant } from '../entry';

export type ConfigTree = Record<string | symbol, any>;

export abstract class Service<S extends ConfigTree = {}> {
  protected tenant!: RuntimeTenant;
  protected config!: S;

  constructor(config: S = {} as S) {
    this.config = config;
  }

  async init(tenant: RuntimeTenant): Promise<Service<S>> {
    if (this.tenant !== undefined) {
      throw new Error('Service is inited with tenant.');
    }
    this.tenant = tenant;
    return this;
  }

  get getTenant(): RuntimeTenant {
    return this.tenant;
  }

  abstract clone(): Service<S>;
}
