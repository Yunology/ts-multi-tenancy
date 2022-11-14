// src/index.ts
import { TenantService } from '@/service';

let tenantService: TenantService;

export function getTenantService(): TenantService {
  return tenantService;
}

