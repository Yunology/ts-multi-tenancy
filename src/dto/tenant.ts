// src/dto/tenant.ts
import { Config } from '../entry';

export class CreateTenantDTO {
  name!: string;
  orgName!: string;
  activate!: boolean;
  config!: Config;
  plan!: string;
}
