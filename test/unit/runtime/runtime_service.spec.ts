// test/unit/runtime/runtime_service.spec.ts
import { expect } from 'chai';

import { TenantPlanInfo } from 'entry';
import { RuntimeService, RuntimeTenant } from 'runtime';

import { AService } from '../../a_service';

describe('class RuntimeService', () => {
  describe('Method initService', () => {
    it('Should raise error if its already inited', async () => {
      const service = new AService();
      const rt = new RuntimeTenant(
        'id',
        'name',
        'org',
        true,
        { database: '' },
        new TenantPlanInfo('name', [], [], []),
        {},
      );
      const rs = new RuntimeService(service, true);
      await expect(rs.initService(rt)).to.eventually.be.rejectedWith(
        Error,
        `TenantID/Name: ${rt.tenantId}/${rt.identityName} already inited ${service.constructor.name}.`,
      );
    });
  });
});
