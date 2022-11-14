// src/index.ts
import { TenantService } from './service';

let tenantService: TenantService;

export * from './controller';
export * from './dto';
export * from './entry';
export * from './infrastructure';
export * from './service';
export * from './datasource';
export function getTenantService(): TenantService {
  return tenantService;
}
