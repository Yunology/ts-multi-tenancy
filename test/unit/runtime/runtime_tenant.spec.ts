// test/unit/runtime/runtime_tenant.spec.ts
import { expect } from 'chai';

import { Permission, TenantPlanInfo } from 'entry';
import { RuntimeTenant, RuntimeService } from 'runtime';

import { AService } from '../../a_service';

describe('RuntimeTenant Entry', () => {
  describe('Method getConfig', () => {
    it('Should get not exists key value without default', () => {
      const rt = new RuntimeTenant(
        'id-test',
        'name',
        'orgName',
        true,
        { database: '' },
        new TenantPlanInfo('name', [], [], []),
        {},
      );
      expect(rt.getConfig('not-exists-key')).to.be.undefined;
    });

    it('Should get not exists key value but return default', () => {
      const rt = new RuntimeTenant(
        'id-test',
        'name',
        'orgName',
        true,
        { database: '' },
        new TenantPlanInfo('name', [], [], []),
        {},
      );
      expect(rt.getConfig('not-exists-key', 'default value')).to.be.eq(
        'default value',
      );
    });

    it('Should get exists key value without default', () => {
      const rt = new RuntimeTenant(
        'id-test',
        'name',
        'orgName',
        true,
        {
          something: 'a value',
          database: '',
        },
        new TenantPlanInfo('name', [], [], []),
        {},
      );
      expect(rt.getConfig('something')).to.be.eq('a value');
    });

    it('Should get exists key value with default', () => {
      const rt = new RuntimeTenant(
        'id-test',
        'name',
        'orgName',
        true,
        {
          something: 'b value',
          database: '',
        },
        new TenantPlanInfo('name', [], [], []),
        {},
      );
      expect(rt.getConfig('something', 'default a value')).to.be.eq(
        'b value',
      );
    });
  });

  describe('Method getRequireConfig', () => {
    it('Should raise error becuase its require config', () => {
      const rt = new RuntimeTenant(
        'id-test',
        'name',
        'orgName',
        true,
        { database: '' },
        new TenantPlanInfo('name', [], [], []),
        {},
      );
      expect(() => rt.getRequireConfig('not-exists')).to.throw(
        Error,
        'Given config key: not-exists is require, but got undefined.',
      );
    });

    it('Should return required config', () => {
      const rt = new RuntimeTenant(
        'id-test',
        'name',
        'orgName',
        true,
        {
          'required-key': 'required value',
          database: '',
        },
        new TenantPlanInfo('name', [], [], []),
        {},
      );
      expect(rt.getRequireConfig('required-key')).to.be.eq('required value');
    });
  });

  describe('Method identityName', () => {
    it('Should get given identityName', () => {
      const rt = new RuntimeTenant(
        'id-test',
        'name',
        'orgName',
        true,
        { database: '' },
        new TenantPlanInfo('name', [], [], []),
        {},
      );
      expect(rt.identityName).to.be.eq('orgName-name');
    });
  });

  describe('Method getPermissionMap', () => {
    it('Should return only root permission map', () => {
      const rt = new RuntimeTenant(
        'id-test',
        'name',
        'orgName',
        true,
        { database: '' },
        new TenantPlanInfo('name', [], [], []),
        {},
      );
      const rootPer = rt.getPermissionMap.ROOT;
      expect(rootPer).not.to.be.undefined;
      expect(rootPer.index).to.be.eq(0xffff);
    });

    it('Should return permision contains inserted', async () => {
      const rt = new RuntimeTenant(
        'id-test',
        'name',
        'orgName',
        true,
        { database: '' },
        new TenantPlanInfo('name', [], [], []),
        {},
      );
      await rt.insertPermission({
        INSERTED: new Permission(0x1111, 'INSERTED'),
      });
      const insertedPer = rt.getPermissionMap.INSERTED;
      expect(insertedPer).not.to.be.undefined;
      expect(insertedPer.index).to.be.eq(0x1111);
      expect(insertedPer.name).to.be.eq('INSERTED');
    });
  });

  describe('Method getPermissions', () => {
    it('Should return only root permission', () => {
      const rt = new RuntimeTenant(
        'id-test',
        'name',
        'orgName',
        true,
        { database: '' },
        new TenantPlanInfo('name', [], [], []),
        {},
      );
      const rootPer = rt.getPermissions.find(({ index }) => index === 0xffff);
      expect(rootPer).not.to.be.undefined;
      expect(rootPer!.index).to.be.eq(0xffff);
    });

    it('Should return permision contains inserted', async () => {
      const rt = new RuntimeTenant(
        'id-test',
        'name',
        'orgName',
        true,
        { database: '' },
        new TenantPlanInfo('name', [], [], []),
        {},
      );
      await rt.insertPermission({
        INSERTED: new Permission(0x1111, 'INSERTED'),
      });
      const insertedPer = rt.getPermissions.find(
        ({ name }) => name === 'INSERTED',
      );
      expect(insertedPer).not.to.be.undefined;
      expect(insertedPer!.index).to.be.eq(0x1111);
      expect(insertedPer!.name).to.be.eq('INSERTED');
    });
  });

  describe('Method isAllowDomain', () => {
    it('disallow with empty', async () => {
      const rt = new RuntimeTenant(
        'id-test',
        'name',
        'orgName',
        true,
        {
          database: '',
          allowDomains: [],
        },
        new TenantPlanInfo('name', [], [], []),
        {},
      );
      await rt.configInitlialize();
      expect(rt.isAllowDomain('somedomain')).to.be.false;
    });

    it('allow with single http', async () => {
      const rt = new RuntimeTenant(
        'id-test',
        'name',
        'orgName',
        true,
        {
          database: '',
          allowDomains: ['http://aaa.com'],
        },
        new TenantPlanInfo('name', [], [], []),
        {},
      );
      await rt.configInitlialize();
      expect(rt.isAllowDomain('http://aaa.com')).to.be.true;
    });

    it('allow with multiple http', async () => {
      const rt = new RuntimeTenant(
        'id-test',
        'name',
        'orgName',
        true,
        {
          database: '',
          allowDomains: ['http://aaa.com', 'http://bbb.com'],
        },
        new TenantPlanInfo('name', [], [], []),
        {},
      );
      await rt.configInitlialize();
      expect(rt.isAllowDomain('http://aaa.com')).to.be.true;
    });

    it('allow with multiple http including https', async () => {
      const rt = new RuntimeTenant(
        'id-test',
        'name',
        'orgName',
        true,
        {
          database: '',
          allowDomains: ['http://aaa.com', 'https://bbb.com'],
        },
        new TenantPlanInfo('name', [], [], []),
        {},
      );
      await rt.configInitlialize();
      expect(rt.isAllowDomain('https://bbb.com')).to.be.true;
    });

    it('disallow with multiple http', async () => {
      const rt = new RuntimeTenant(
        'id-test',
        'name',
        'orgName',
        true,
        {
          database: '',
          allowDomains: ['http://aaa.com', 'http://bbb.com'],
        },
        new TenantPlanInfo('name', [], [], []),
        {},
      );
      await rt.configInitlialize();
      expect(rt.isAllowDomain('http://ccc.com')).to.be.false;
    });
  });

  describe('Method module', () => {
    it('Should raise error because given module name is not exists', () => {
      const rt = new RuntimeTenant(
        'id-test',
        'name',
        'orgName',
        true,
        { database: '' },
        new TenantPlanInfo('name', [], [], []),
        {},
      );
      expect(() => rt.service(AService)).to.throw(
        Error,
        'Such tenant not allow to use given service' +
          ' or service is not exists: AService',
      );
    });

    it('Should get inserted module by class', () => {
      const plan = new TenantPlanInfo('name', [], [], []);
      const rt = new RuntimeTenant(
        'id-test',
        'name',
        'orgName',
        true,
        { database: '' },
        plan,
        {
          [AService.name]: new RuntimeService(new AService()),
        },
      );
      const module = rt.service(AService);
      expect(module).not.to.be.undefined;
      expect(module.constructor.name).to.be.eq('AService');
    });

    it('Should get inserted module by class name', () => {
      const plan = new TenantPlanInfo('name', [], [], []);
      const rt = new RuntimeTenant(
        'id-test',
        'name',
        'orgName',
        true,
        { database: '' },
        plan,
        {
          [AService.name]: new RuntimeService(new AService()),
        },
      );
      expect(rt.service('AService')).not.to.be.undefined;

      const module = rt.service(AService);
      expect(module).not.to.be.undefined;
      expect(module.constructor.name).to.be.eq('AService');
    });
  });

  describe('Method insertPermission', () => {
    it(
      'Should raise error ' +
        'due to two duplicate permission in one group injected',
      async () => {
        await expect(
          new RuntimeTenant(
            'test-id',
            'name',
            'orgName',
            true,
            { database: '' },
            new TenantPlanInfo('test', [], [], []),
            {},
          ).insertPermission({
            A: new Permission(0x0001, 'A', ''),
            DUP_A: new Permission(0x0001, 'DUP_A', ''),
            B: new Permission(0x0002, 'B', ''),
          }),
        ).eventually.rejectedWith(
          Error,
          'Duplicate Permission: [A-1, DUP_A-1]',
        );
      },
    );

    it(
      'Should raise error ' +
        'due to three duplicate permission in one group injected',
      async () => {
        await expect(
          new RuntimeTenant(
            'test-id',
            'name',
            'orgName',
            true,
            { database: '' },
            new TenantPlanInfo('test', [], [], []),
            {},
          ).insertPermission({
            A: new Permission(0x0001, 'A', ''),
            DUP_A: new Permission(0x0001, 'DUP_A', ''),
            DUP_AB: new Permission(0x0001, 'DUP_AB', ''),
            B: new Permission(0x0002, 'B', ''),
          }),
        ).eventually.rejectedWith(
          Error,
          'Duplicate Permission: [A-1, DUP_A-1, DUP_AB-1]',
        );
      },
    );

    it(
      'Should raise error ' +
        'due to four duplicate permission in two group injected',
      async () => {
        await expect(
          new RuntimeTenant(
            'test-id',
            'name',
            'orgName',
            true,
            { database: '' },
            new TenantPlanInfo('test', [], [], []),
            {},
          ).insertPermission({
            A: new Permission(0x0001, 'A', ''),
            DUP_A: new Permission(0x0001, 'DUP_A', ''),
            B: new Permission(0x0002, 'B', ''),
            DUP_B: new Permission(0x0002, 'DUP_B', ''),
            C: new Permission(0x0003, 'C', ''),
          }),
        ).eventually.rejectedWith(
          Error,
          'Duplicate Permission: [A-1, DUP_A-1], [B-2, DUP_B-2]',
        );
      },
    );
  });

  describe('Method isPermissionMatched', async () => {
    const rt = new RuntimeTenant(
      'id-test',
      'name',
      'orgName',
      true,
      { database: '' },
      new TenantPlanInfo('name', [], [], []),
      {},
    );
    const catRootPer = new Permission(0x11ff, 'TO-TEST-ROOT');
    const per = new Permission(0x1111, 'TO-TEST');
    const notMatchPer = new Permission(0x2222, 'NOT-MATCH');
    await rt.insertPermission({
      'TO-TEST': per,
      'TO-TEST-ROOT': catRootPer,
    });

    it('Should return true since we use root permission', () => {
      expect(rt.isPermissionMatched(rt.getPermissionMap.ROOT, per)).to.be
        .true;
    });

    it('Should return true since we use root permission index', () => {
      expect(rt.isPermissionMatched(0xffff, per)).to.be.true;
    });

    it('Should return true since we use category permission', () => {
      expect(rt.isPermissionMatched(catRootPer, per)).to.be.true;
    });

    it('Should return true since we use category permission index', () => {
      expect(rt.isPermissionMatched(catRootPer.index, per)).to.be.true;
    });

    it('Should return true since we matched given permisson', () => {
      expect(rt.isPermissionMatched(per, per)).to.be.true;
    });

    it('Should return true since we matched given permisson index', () => {
      expect(rt.isPermissionMatched(per.index, per)).to.be.true;
    });

    it('Should return false since we are not matched given permisson', () => {
      expect(rt.isPermissionMatched(notMatchPer, per)).to.be.false;
    });

    it('Should return false since we are not matched given permisson index', () => {
      expect(rt.isPermissionMatched(notMatchPer.index, per)).to.be.false;
    });
  });
});
