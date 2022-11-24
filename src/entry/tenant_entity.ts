// src/entry/tenant_entity.ts
import { JoinColumn, ManyToOne } from 'typeorm';

import { BaseEntity } from './base_entity';
import { Tenant } from './tenant.entry';

export class TenantEntity extends BaseEntity {
  @ManyToOne(() => Tenant, (t) => t.id)
  @JoinColumn({ name: 'tenant' })
  tenant!: Tenant;
}
