// test/unit/helper/permission.spec.ts
import { expect } from 'chai';

import { filterInvalidPermission } from 'helper';
import { Permission } from 'index';

describe('Helper Permission', () => {
  describe('Method filterInvalidPermission', () => {
    it('Should return empty', () => {
      const permission = new Permission(0x0001, '0x0001');
      const permission2 = new Permission(0x0002, '0x0002');
      expect(filterInvalidPermission(
        [permission, permission2],
        [0x0001],
      )).to.be.empty;
    });

    it('Should return 99999', () => {
      expect(filterInvalidPermission([], [99999])).to.be.deep.eq([99999]);
    });
  });
});
