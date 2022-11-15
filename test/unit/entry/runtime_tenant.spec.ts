// test/unit/entry/runtime_tenant.spec.ts
import { expect } from 'chai';

import { Permission, RuntimeTenant, Tenant, TenantPlanInfo } from '../../../src';

describe('RuntimeTenant Entry', () => {
  describe('Method insertPermission', () => {
    it('Should raise error due to two duplicate permission in one group injected', async () => {
      await expect(new RuntimeTenant(
        new Tenant(), new TenantPlanInfo('test', [], [], []), {},
      ).insertPermission({
        A: new Permission(0x0001, 'A', ''),
        DUP_A: new Permission(0x0001, 'DUP_A', ''),
        B: new Permission(0x0002, 'B', ''),
      })).eventually.rejectedWith(Error, 'Duplicate Permission: [A-1, DUP_A-1]');
    });

    it('Should raise error due to three duplicate permission in one group injected', async () => {
      await expect(new RuntimeTenant(
        new Tenant(), new TenantPlanInfo('test', [], [], []), {},
      ).insertPermission({
        A: new Permission(0x0001, 'A', ''),
        DUP_A: new Permission(0x0001, 'DUP_A', ''),
        DUP_AB: new Permission(0x0001, 'DUP_AB', ''),
        B: new Permission(0x0002, 'B', ''),
      })).eventually.rejectedWith(Error, 'Duplicate Permission: [A-1, DUP_A-1, DUP_AB-1]');
    });

    it('Should raise error due to four duplicate permission in two group injected', async () => {
      await expect(new RuntimeTenant(
        new Tenant(), new TenantPlanInfo('test', [], [], []), {},
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
