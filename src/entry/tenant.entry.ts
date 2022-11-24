// src/entry/tenant.entry.ts
import {
  Column, Entity, PrimaryColumn, ManyToOne,
} from 'typeorm';

import { BaseEntity } from './base_entity';
import { Database } from './database.entry';
import { Config } from './config';
import { TenantPlanInfo, TenantPlanColumn } from './tenant_plan';

@Entity({ name: 'tenant' })
export class Tenant extends BaseEntity {
  @PrimaryColumn({ type: 'varchar' })
  name!: string;

  @Column({ name: 'org_name', type: 'varchar', primary: true })
  orgName!: string;

  @Column({ type: 'boolean', default: false })
  activate!: boolean;

  @ManyToOne(() => Database)
  database!: Database;

  @Column({ name: 'config', type: 'json', default: {} })
  config!: Config;

  @TenantPlanColumn()
  plan!: TenantPlanInfo;
}
