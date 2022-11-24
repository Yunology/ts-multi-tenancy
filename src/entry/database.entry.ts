// src/entry/database.entry.ts
import { Entity, PrimaryColumn } from 'typeorm';

import { BaseEntity } from './base_entity';

@Entity({ name: 'database', schema: 'public' })
export class Database extends BaseEntity {
  @PrimaryColumn({ type: 'varchar' })
  name!: string;

  @PrimaryColumn({ type: 'varchar' })
  url!: string;
}
