// test/unit/entry/runtime_tenant.spec.ts
import { expect } from 'chai';

import { Permission, RuntimeTenant, TenantPlanInfo } from '../../../src';

describe('RuntimeTenant Entry', () => {
  describe('Method getConfig', () => {
    it('Should get not exists key value without default', () => {
      const rt = new RuntimeTenant(
        'id-test', 'name', 'orgName', true, {},
        new TenantPlanInfo('name', [], [], []), {},
      );
      expect(rt.getConfig('not-exists-key')).to.be.undefined;
    });

    it('Should get not exists key value but return default', () => {
      const rt = new RuntimeTenant(
        'id-test', 'name', 'orgName', true, {},
        new TenantPlanInfo('name', [], [], []), {},
      );
      expect(rt.getConfig('not-exists-key', 'default value')).to.be.eq('default value');
    });

    it('Should get exists key value without default', () => {
      const rt = new RuntimeTenant(
        'id-test', 'name', 'orgName', true, {
          'something': 'a value',
        },
        new TenantPlanInfo('name', [], [], []), {},
      );
      expect(rt.getConfig('something')).to.be.eq('a value');
    });

    it('Should get exists key value with default', () => {
      const rt = new RuntimeTenant(
        'id-test', 'name', 'orgName', true, {
          'something': 'b value',
        },
        new TenantPlanInfo('name', [], [], []), {},
      );
      expect(rt.getConfig('something', 'default a value')).to.be.eq('b value');
    });
  });

  describe('Method isAllowDomain', () => {
    it('disallow with empty', async () => {
      const rt = new RuntimeTenant(
        'id-test', 'name', 'orgName', true, {
          'allowDomains': [],
        }, new TenantPlanInfo('name', [], [], []), {},
      );
      await rt.configInitlialize();
      expect(rt.isAllowDomain('somedomain')).to.be.false;
    });

    it('allow with single http', async () => {
      const rt = new RuntimeTenant(
        'id-test', 'name', 'orgName', true, {
          'allowDomains': ['http://aaa.com'],
        }, new TenantPlanInfo('name', [], [], []), {},
      );
      await rt.configInitlialize();
      expect(rt.isAllowDomain('http://aaa.com')).to.be.true;
    });

    it('allow with multiple http', async () => {
      const rt = new RuntimeTenant(
        'id-test', 'name', 'orgName', true, {
          'allowDomains': ['http://aaa.com', 'http://bbb.com'],
        }, new TenantPlanInfo('name', [], [], []), {},
      );
      await rt.configInitlialize();
      expect(rt.isAllowDomain('http://aaa.com')).to.be.true;
    });

    it('allow with multiple http including https', async () => {
      const rt = new RuntimeTenant(
        'id-test', 'name', 'orgName', true, {
          'allowDomains': ['http://aaa.com', 'https://bbb.com'],
        }, new TenantPlanInfo('name', [], [], []), {},
      );
      await rt.configInitlialize();
      expect(rt.isAllowDomain('https://bbb.com')).to.be.true;
    });

    it('disallow with multiple http', async () => {
      const rt = new RuntimeTenant(
        'id-test', 'name', 'orgName', true, {
          'allowDomains': ['http://aaa.com', 'http://bbb.com'],
        }, new TenantPlanInfo('name', [], [], []), {},
      );
      await rt.configInitlialize();
      expect(rt.isAllowDomain('http://ccc.com')).to.be.false;
    });
  });

  describe('Method insertPermission', () => {
    it('Should raise error due to two duplicate permission in one group injected', async () => {
      await expect(new RuntimeTenant(
        'test-id', 'name', 'orgName', true, {}, new TenantPlanInfo('test', [], [], []), {},
      ).insertPermission({
        A: new Permission(0x0001, 'A', ''),
        DUP_A: new Permission(0x0001, 'DUP_A', ''),
        B: new Permission(0x0002, 'B', ''),
      })).eventually.rejectedWith(Error, 'Duplicate Permission: [A-1, DUP_A-1]');
    });

    it('Should raise error due to three duplicate permission in one group injected', async () => {
      await expect(new RuntimeTenant(
        'test-id', 'name', 'orgName', true, {}, new TenantPlanInfo('test', [], [], []), {},
      ).insertPermission({
        A: new Permission(0x0001, 'A', ''),
        DUP_A: new Permission(0x0001, 'DUP_A', ''),
        DUP_AB: new Permission(0x0001, 'DUP_AB', ''),
        B: new Permission(0x0002, 'B', ''),
      })).eventually.rejectedWith(Error, 'Duplicate Permission: [A-1, DUP_A-1, DUP_AB-1]');
    });

    it('Should raise error due to four duplicate permission in two group injected', async () => {
      await expect(new RuntimeTenant(
        'test-id', 'name', 'orgName', true, {}, new TenantPlanInfo('test', [], [], []), {},
      ).insertPermission({
        A: new Permission(0x0001, 'A', ''),
        DUP_A: new Permission(0x0001, 'DUP_A', ''),
        B: new Permission(0x0002, 'B', ''),
        DUP_B: new Permission(0x0002, 'DUP_B', ''),
        C: new Permission(0x0003, 'C', ''),
      })).eventually.rejectedWith(Error, 'Duplicate Permission: [A-1, DUP_A-1], [B-2, DUP_B-2]');
    });
  });
});
