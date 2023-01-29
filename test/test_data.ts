// test/test_data.ts
import { v4 } from 'uuid';

import { Database, Tenant } from 'index';

export const systemDb: Database = new Database();
systemDb.id = v4();
systemDb.name = 'yunology-test';

export const tenant: Tenant = new Tenant();
tenant.name = 'test';
tenant.orgName = 'yunology';
tenant.activate = true;
tenant.config = {
  database: systemDb.id,
  govCode: 123456,
  classType: [1],
  vehicleType: [1],
  salt: 'test_only_salt',
};
