// test/unit/entry/runtime_tenant.spec.ts
import { expect } from 'chai';

import { Permission, RuntimeTenant, TenantPlanInfo } from '../../../src';
import { AModule } from '../../a_module';

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

  describe('Method getRequireConfig', () => {
    it('Should raise error becuase its require config', () => {
      const rt = new RuntimeTenant(
        'id-test', 'name', 'orgName', true, {},
        new TenantPlanInfo('name', [], [], []), {},
      );
      expect(() => rt.getRequireConfig('not-exists')).to.throw(
        Error, 'Given config key: not-exists is require, but got undefined.',
      );
    });

    it('Should return required config', () => {
      const rt = new RuntimeTenant(
        'id-test', 'name', 'orgName', true, {
          'required-key': 'required value',
        },
        new TenantPlanInfo('name', [], [], []), {},
      );
      expect(rt.getRequireConfig('required-key')).to.be.eq('required value');
    });
  });

  describe('Method identityName', () => {
    it('Should get given identityName', () => {
      const rt = new RuntimeTenant(
        'id-test', 'name', 'orgName', true, {},
        new TenantPlanInfo('name', [], [], []), {},
      );
      expect(rt.identityName).to.be.eq('orgName-name');
    });
  });

  describe('Method getPermissionMap', () => {
    it('Should return only root permission map', () => {
      const rt = new RuntimeTenant(
        'id-test', 'name', 'orgName', true, {},
        new TenantPlanInfo('name', [], [], []), {},
      );
      const rootPer = rt.getPermissionMap['ROOT'];
      expect(rootPer).not.to.be.undefined;
      expect(rootPer.index).to.be.eq(0xFFFF);
    });

    it('Should return permision contains inserted', async () => {
      const rt = new RuntimeTenant(
        'id-test', 'name', 'orgName', true, {},
        new TenantPlanInfo('name', [], [], []), {},
      );
      await rt.insertPermission({
        'INSERTED': new Permission(0x1111, 'INSERTED'),
      });
      const insertedPer = rt.getPermissionMap['INSERTED'];
      expect(insertedPer).not.to.be.undefined;
      expect(insertedPer.index).to.be.eq(0x1111);
      expect(insertedPer.name).to.be.eq('INSERTED');
    });
  });

  describe('Method getPermissions', () => {
    it('Should return only root permission', () => {
      const rt = new RuntimeTenant(
        'id-test', 'name', 'orgName', true, {},
        new TenantPlanInfo('name', [], [], []), {},
      );
      const rootPer = rt.getPermissions.find(({ index }) => index === 0xFFFF);
      expect(rootPer).not.to.be.undefined;
      expect(rootPer!.index).to.be.eq(0xFFFF);
    });

    it('Should return permision contains inserted', async () => {
      const rt = new RuntimeTenant(
        'id-test', 'name', 'orgName', true, {},
        new TenantPlanInfo('name', [], [], []), {},
      );
      await rt.insertPermission({
        'INSERTED': new Permission(0x1111, 'INSERTED'),
      });
      const insertedPer = rt.getPermissions.find(({ name }) => name === 'INSERTED');
      expect(insertedPer).not.to.be.undefined;
      expect(insertedPer!.index).to.be.eq(0x1111);
      expect(insertedPer!.name).to.be.eq('INSERTED');
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

  describe('Method module', () => {
    it('Should raise error because given module name is not exists', () => {
      const rt = new RuntimeTenant(
        'id-test', 'name', 'orgName', true, {},
        new TenantPlanInfo('name', [], [], []), {},
      );
      expect(() => rt.module(AModule)).to.throw(
        Error,
        'Such tenant not allow to use given module'
        + ' or module is not exists: AModule',
      );
    });

    it('Should get inserted module by class', () => {
      const plan = new TenantPlanInfo('name', [], [], []);
      const rt = new RuntimeTenant(
        'id-test', 'name', 'orgName', true, {}, plan, {
          [AModule.name]: new AModule(),
        },
      );
      expect(rt.module(AModule)).not.to.be.undefined;
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
