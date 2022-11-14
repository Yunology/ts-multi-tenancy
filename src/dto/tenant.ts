// src/dto/tenant.ts
import { Config, TenantPlan } from '@/entry';

export class CreateTenantDTO {
  name!: string;
  orgName!: string;
  activate!: boolean;
  database!: string;
  config!: Config;
  plan!: TenantPlan;
}
