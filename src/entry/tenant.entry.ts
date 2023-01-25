// src/entry/tenant.entry.ts
import { Column, Entity, PrimaryColumn } from 'typeorm';

import { BaseEntity } from './base_entity';
import { Config } from './config';
import { TenantPlanInfo, TenantPlanColumn } from './tenant_plan';

@Entity({ name: 'tenant', schema: 'public' })
export class Tenant extends BaseEntity {
  @PrimaryColumn({ type: 'varchar' })
  name!: string;

  @Column({ name: 'org_name', type: 'varchar', primary: true })
  orgName!: string;

  @Column({ type: 'boolean', default: false })
  activate!: boolean;

  @Column({ name: 'config', type: 'json', default: {} })
  config!: Config;

  @TenantPlanColumn()
  plan!: TenantPlanInfo;
}
