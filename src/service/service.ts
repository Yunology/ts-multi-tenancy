// src/service/service.ts
import { RuntimeTenant } from '../entry';

export abstract class Service {
  protected tenant!: RuntimeTenant;

  async init(tenant: RuntimeTenant): Promise<Service> {
    if (this.tenant !== undefined) {
      throw new Error('Service is inited with tenant.');
    }
    this.tenant = tenant;
    return this;
  }

  get getTenant(): RuntimeTenant {
    return this.tenant;
  }

  abstract clone(): Service;
}
