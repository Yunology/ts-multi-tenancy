// src/service/service.ts
import { RuntimeTenant } from '../entry';

export type ConfigTree = Record<string | symbol, any>;

export abstract class Service<C extends ConfigTree = {}> {
  protected tenant!: RuntimeTenant;
  protected config!: C;

  constructor(config: C = {} as C) {
    this.config = config;
  }

  async init(tenant: RuntimeTenant): Promise<Service<C>> {
    if (this.tenant !== undefined) {
      throw new Error('Service is inited with tenant.');
    }
    this.tenant = tenant;

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

  abstract clone(): Service<C>;
}
