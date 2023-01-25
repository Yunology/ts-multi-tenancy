// src/entry/runtime_tenant.ts
import { DataSource } from 'typeorm';
import { groupBy, isEmpty, isUndefined, omitBy } from 'lodash';

import { Service, RuntimeService } from '../service';
import { TenantPlanInfo } from './tenant_plan';
import { Permission, Config } from '.';

export class RuntimeTenant {
  private id: string;
  private name: string;
  private orgName: string;
  private activate: boolean;
  private config: Config;
  private plan: TenantPlanInfo;
  private dataSource!: DataSource;
  private runtimeServices: Record<string, RuntimeService>;
  private permissions: { [key: string]: Permission } = {
    ROOT: new Permission(0xffff, 'ROOT', '管理員權限'),
  };
  private allowDomains: Array<string> = [];

  constructor(
    id: string,
    name: string,
    orgName: string,
    activate: boolean,
    config: Config,
    plan: TenantPlanInfo,
    runtimeServices: Record<string, RuntimeService>,
  ) {
    this.id = id;
    this.name = name;
    this.orgName = orgName;
    this.activate = activate;
    this.config = config;
    this.plan = plan;
    this.runtimeServices = runtimeServices;
  }

  setupDataSource(ds: DataSource) {
    this.dataSource = ds;
  }

  async runtimeServiceInitlialize(): Promise<void> {
    for (const rs of Object.values(this.runtimeServices)) {
      rs.initService(this);
    }
  }

  async configInitlialize(): Promise<void> {
    this.allowDomains = this.getConfig<Array<string>>('allowDomains', []);
  }

  get getPlan(): TenantPlanInfo {
    return this.plan;
  }

  get getConfig(): <T>(key: string, defaultValue?: T) => T {
    return <T>(key: string, defaultValue?: T): T =>
      this.config[key] || defaultValue;
  }

  get getRequireConfig(): <T>(key: string) => T {
    return <T>(key: string): T => {
      const value = this.config[key];
      if (isUndefined(value)) {
        throw new Error(
          `Given config key: ${key} is require, but got undefined.`,
        );
      }
      return value as T;
    };
  }

  get tenantId(): string {
    return this.id;
  }

  get identityName(): string {
    return `${this.orgName}-${this.name}`;
  }

  get ds(): DataSource {
    return this.dataSource;
  }

  get getConfigMap(): Record<string | symbol, any> {
    return this.config;
  }

  get getPermissionMap(): Record<string, Permission> {
    return this.permissions;
  }

  get getPermissions(): Array<Permission> {
    return Object.values(this.permissions);
  }

  get isAllowDomain(): (origin: string) => boolean {
    return (origin: string) => this.allowDomains.includes(origin);
  }

  service<T extends Service>(t: (new (...args: any[]) => T) | string): T {
    const name = typeof t === 'string' ? t : t.name;
    const found = this.runtimeServices[name];
    if (isUndefined(found)) {
      throw new Error(
        'Such tenant not allow to use given service' +
          ` or service is not exists: ${name}`,
      );
    }
    return found.getService as T;
  }

  private examinePermissionDuplicate(): Record<number, Array<Permission>> {
    return omitBy(
      groupBy(Object.values(this.permissions), ({ index }) => index),
      ({ length }) => length === 1,
    );
  }

  public async insertPermission(
    permissions: Record<string, Permission>,
  ): Promise<void> {
    this.permissions = {
      ...permissions,
      ...this.permissions,
    };
    const duplicates = this.examinePermissionDuplicate();
    if (!isEmpty(duplicates)) {
      throw new Error(
        `Duplicate Permission: ${Object.values(duplicates)
          .map(
            (each) =>
              `[${each
                .map(({ name, index }) => `${name}-${index}`)
                .join(', ')}]`,
          )
          .join(', ')}`,
      );
    }
  }

  /**
   * Test including root permission
   * If the test permission is 0x0101, given 0x0101, 0x01FF and 0xFFFF will pass.
   * @param target Permission or permission index to be test.
   * @param test Permission or permission index to be compare.
   * @returns matched or not.
   */
  public isPermissionMatched(
    target: Permission | number,
    test: Permission | number,
  ): boolean {
    const targetInstance =
      target instanceof Permission ? target.index : target;
    const testInstance = test instanceof Permission ? test.index : test;
    if (targetInstance === 0xffff || targetInstance === testInstance) {
      return true;
    }

    /* eslint-disable no-bitwise */
    const targetCategory = targetInstance & 0xff00;
    const testCategory = testInstance & 0xff00;
    /* eslint-enable no-bitwise */
    if (targetCategory !== testCategory) {
      return false;
    }

    const targetValue = targetInstance - targetCategory;
    return targetValue === 0x00ff;
  }
}
