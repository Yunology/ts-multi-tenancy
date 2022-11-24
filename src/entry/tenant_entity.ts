// src/entry/tenant_entity.ts
import { Column } from 'typeorm';

import { BaseEntity } from './base_entity';

export class TenantEntity extends BaseEntity {
  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;
}
