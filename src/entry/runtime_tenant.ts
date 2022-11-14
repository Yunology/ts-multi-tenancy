// src/entry/runtime_tenant.ts
import { DataSource } from 'typeorm';
import { groupBy, isEmpty, isUndefined, omitBy } from 'lodash';

import { Tenant } from './tenant.entry';
import { Database } from './database.entry';
import { TenantPlanInfo } from './tenant_plan';

import { Service } from '../service';
import { Permission } from '../entry';
import { getDataSource, createDataSource } from '../datasource';

export class RuntimeTenant {
  private tenant: Tenant;
  private plan: TenantPlanInfo;
  private dataSource!: DataSource;
  private modules: Record<string, Service>;
  private permissions: { [key: string]: Permission } = {
    ROOT: new Permission(0xFFFF, 'ROOT', '管理員權限'),
  };

  constructor(
    tenant: Tenant,
    plan: TenantPlanInfo,
    modules: Record<string, Service>,
  ) {
    this.tenant = tenant;
    this.plan = plan;
    this.modules = modules;
  }

  async precreateSchema({ name, url }: Database, schema: string): Promise<void> {
    let systemDb: DataSource | undefined = getDataSource(name);
    if (systemDb === undefined) {
      systemDb = createDataSource(name, 'public', { url });
    }

    if (!systemDb.isInitialized) { await systemDb.initialize(); }
    await systemDb.manager.query(`CREATE SCHEMA IF NOT EXISTS ${schema}`);
    await systemDb.destroy();
  }

  async precreateDataSource({ name, url }: Database): Promise<void> {
    const { schemaName, entries, migrations } = this.plan;

    this.dataSource = createDataSource(name, schemaName, {
      url,
      entities: entries,
      migrations,
    });
    if (!this.dataSource.isInitialized) { await this.dataSource.initialize(); }
  }

  async moduleInitlialize(): Promise<void> {
    for (const module of Object.values(this.modules)) {
      await module.init(this);
    }
  }

  get getTenant(): Tenant {
    return this.tenant;
  }

  get getConfig(): <T>(key: string, defaultValue?: T) => T{
    return <T>(key: string, defaultValue?: T): T => (
      this.tenant.config[key] || defaultValue
    );
  }

  get getRequireConfig(): <T>(key: string) => T {
    return <T>(key: string): T => {
      const value = this.tenant.config[key];
      if (isUndefined(value)) {
        throw new Error(`Given config key: ${key} is require, but got undefined.`);
      }
      return value as T;
    };
  }

  get identityName(): string {
    return `${this.tenant.orgName}-${this.tenant.name}`;
  }

  get ds(): DataSource {
    return this.dataSource;
  }

  get getPermissionMap(): Record<string, Permission> {
    return this.permissions;
  }

  get getPermissions(): Array<Permission> {
    return Object.values(this.permissions);
  }

  module<T extends Service>(t: (new (...args: any[]) => T) | string): T {
    const name = typeof t === 'string' ? t : t.name;
    const found = this.modules[name];
    if (isUndefined(found)) {
      throw new Error(
        'Such tenant not allow to use given module'
        + ` or module is not exists: ${name}`,
      );
    }
    return found as T;
  }

  private examinePermissionDuplicate(): Record<number, Array<Permission>> {
    return omitBy(
      groupBy(Object.values(this.permissions), ({ index }) => index),
      (({ length }) => length === 1),
    );
  }

  public async insertPermission(permissions: Record<string, Permission>): Promise<void> {
    this.permissions = {
      ...permissions,
      ...this.permissions,
    };
    const duplicates = this.examinePermissionDuplicate();
    if (!isEmpty(duplicates)) {
      throw new Error(`Duplicate Permission: ${Object.values(duplicates)
        .map((each) => `[${each.map(({ name, index }) => `${name}-${index}`).join(', ')}]`)
        .join(', ')}`);
    }
  }

  /**
   * Test including root permission
   * If the test permission is 0x0101, given 0x0101, 0x01FF and 0xFFFF will pass.
   * @param target Permission or permission index to be test.
   * @param test Permission or permission index to be compare.
   * @returns matched or not.
   */
   private isPermissionMatched(target: Permission | number, test: Permission | number): boolean {
    const targetInstance = target instanceof Permission ? target.index : target;
    const testInstance = test instanceof Permission ? test.index : test;
    if (targetInstance === 0xFFFF || targetInstance === testInstance) { return true; }

    const targetCategory = targetInstance & 0xFF00;
    const testCategory = testInstance & 0xFF00;
    if (targetCategory !== testCategory) { return false; }

    const targetValue = targetInstance - targetCategory;
    if (targetValue === 0x00FF) { return true; }
    const testValue = testInstance - testCategory;
    return targetValue === testValue;
  }
}
