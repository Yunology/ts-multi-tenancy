// src/entry/database.entry.ts
import { Entity, PrimaryColumn } from 'typeorm';

import { BaseEntity } from './base.entry';

@Entity({ name: 'database' })
export class Database extends BaseEntity {
  @PrimaryColumn({ type: 'varchar' })
  name!: string;

  @PrimaryColumn({ type: 'varchar' })
  url!: string;
}
