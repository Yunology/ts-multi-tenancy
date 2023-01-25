// src/service/runtime_service.ts
import { RuntimeTenant } from '../runtime';

import { Service } from '.';

export class RuntimeService {
  private inited: boolean;
  private service: Service;

  constructor(service: Service, inited = false) {
    this.service = service;
    this.inited = inited;
  }

  async initService(runtimeTenant: RuntimeTenant): Promise<Service> {
    if (this.isInited) {
      throw new Error(`TenantID/Name: ${runtimeTenant.tenantId}/${runtimeTenant.identityName} already inited ${this.service.constructor.name}.`);
    }
    this.inited = true;
    return this.service.init(runtimeTenant);
  }

  get isInited(): boolean {
    return this.inited;
  }

  get getService(): Service {
    return this.service;
  }
}
