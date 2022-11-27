// src/error.ts
import { RuntimeTenant } from './entry';

export class TenantError extends Error {
  private readonly runtimeTenant: RuntimeTenant;

  constructor(runtimeTenant: RuntimeTenant, msg: string) {
    super(msg);
    this.runtimeTenant = runtimeTenant;
    Object.setPrototypeOf(this, TenantError.prototype);
  }
}
