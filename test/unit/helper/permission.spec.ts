// test/unit/helper/permission.spec.ts
import { expect } from 'chai';

import {
  filterInvalidPermission,
  SetupPermission,
  PermissionTree,
} from 'helper';
import { Permission, TenantPlanInfo } from 'entry';

import { RuntimeTenant, Service } from 'index';

describe('Helper Permission', () => {
  describe('Method filterInvalidPermission', () => {
    it('Should return empty', () => {
      const permission = new Permission(0x0001, '0x0001');
      const permission2 = new Permission(0x0002, '0x0002');
      expect(filterInvalidPermission([permission, permission2], [0x0001])).to
        .be.empty;
    });

    it('Should return 99999', () => {
      expect(filterInvalidPermission([], [99999])).to.be.deep.eq([99999]);
    });
  });

  describe('SetupPermission', () => {
    it('Should raise error because not child class', () => {
      interface APermission extends PermissionTree {
        A: Permission;
      }

      class AService {}

      expect(() =>
        SetupPermission<APermission>({
          A: new Permission(0x0001, 'A', ''),
        })(AService),
      ).to.throw(`SetupPermission can only use at Service's child classes.`);
    });

    it('Should contain permissions in runtime tenant', async () => {
      interface BPermission extends PermissionTree {
        B: Permission;
      }

      @SetupPermission<BPermission>({
        B: new Permission(0x0001, 'B', ''),
      })
      class BService extends Service {}

      const rt = new RuntimeTenant(
        'id',
        'name',
        'orgName',
        true,
        { database: '' },
        new TenantPlanInfo('name', [], [], []),
        {},
      );
      const service = new BService();
      await service.init(rt);
      expect(
        rt.getPermissions.some((per) => rt.isPermissionMatched(per, 0x0001)),
      ).to.be.true;
    });
  });
});
