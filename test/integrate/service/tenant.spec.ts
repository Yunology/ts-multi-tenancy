// test/integrate/service/tenant.spec.ts
import { expect } from 'chai';

import { getTenantService } from 'index';
import { tenant } from '../../test_data';

describe('TenantService', () => {
  describe('Method getTenantByInfo', () => {
    it('Should return undefined with exists tenantName', () => {
      const gotTenant = getTenantService().getTenantByInfo(
        `${tenant.orgName}-${tenant.name}`,
      );
      expect(gotTenant).not.to.be.undefined;
      expect(gotTenant!.tenantId).to.be.eq(tenant.id);
    });

    it('Should return undefined with not exists tenantName', () => {
      const gotTenant = getTenantService().getTenantByInfo('not exists name');
      expect(gotTenant).to.be.undefined;
    });

    it('Should return undefined with exists tenantId', () => {
      const gotTenant = getTenantService().getTenantByInfo(tenant.id);
      expect(gotTenant).not.to.be.undefined;
      expect(gotTenant!.tenantId).to.be.eq(tenant.id);
    });

    it('Should return undefined with not exists tenantId', () => {
      const gotTenant = getTenantService().getTenantByInfo('not exists id');
      expect(gotTenant).to.be.undefined;
    });
  });
});
