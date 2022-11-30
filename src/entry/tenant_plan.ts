// src/entry/tenant_plan.ts
/* eslint-disable @typescript-eslint/ban-types, no-underscore-dangle */
import { Column, ColumnOptions } from 'typeorm';

import { Service } from '../service';
import { getPlan } from '..';

export class TenantPlanInfo {
  private readonly _schemaName: string;
  private readonly _modules: Array<typeof Service>;
  private readonly _entries: Array<Function>;
  private readonly _migrations: Array<Function>;

  constructor(
    schemaName: string,
    modules: Array<typeof Service>,
    entries: Array<Function>,
    migrations: Array<Function>,
  ) {
    this._schemaName = schemaName;
    this._modules = modules;
    this._entries = entries;
    this._migrations = migrations;
  }

  get schemaName(): string {
    return this._schemaName;
  }

  get modulesName(): Array<string> {
    return this._modules.map((each) => each.name);
  }

  get entries(): Array<Function> {
    return this._entries;
  }

  get migrations(): Array<Function> {
    return this._migrations;
  }
}

export const TenantPlanColumn: (options?: ColumnOptions) => PropertyDecorator = (
  options?: ColumnOptions,
) => Column({
  ...options,
  type: 'varchar',
  transformer: {
    to: (value: TenantPlanInfo) => value.schemaName,
    from: (value: string) => getPlan(value),
  },
});
