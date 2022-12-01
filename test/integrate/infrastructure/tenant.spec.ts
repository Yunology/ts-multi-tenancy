// test/integrate/infrastructure/tenant.spec.ts
import { expect } from 'chai';
import { EntityManager } from 'typeorm';

import { Database, getPlan, Tenant, TenantInfrastructure } from 'index';

import { autoRollbackTransaction } from '../hook.spec';

describe('Tenant Infrastructure', () => {
  describe('Method getTenants', () => {
    it('Should get empty because there is nothing in db', async () => {
      await autoRollbackTransaction(async (manager: EntityManager) => {
        const dbs = await TenantInfrastructure.getInstance().getTenantries(
          manager,
        );
        expect(dbs.length).to.be.eq(0);
      });
    });

    it('Should get all tenantriess', async () => {
      await autoRollbackTransaction(async (manager: EntityManager) => {
        const plan = getPlan('TEST-PLAN');
        const db = await manager
          .getRepository(Database)
          .save({ name: 'name1', url: 'url1' });
        await manager.getRepository(Tenant).save({
          name: 'name1',
          orgName: 'orgName1',
          activate: true,
          database: db,
          config: {},
          plan,
        });
        await manager.getRepository(Tenant).save({
          name: 'name2',
          orgName: 'orgName2',
          activate: true,
          database: db,
          config: {},
          plan,
        });

        const dbs = await TenantInfrastructure.getInstance().getTenantries(
          manager,
        );
        expect(dbs.length).to.be.eq(2);
        expect(dbs.find(({ name }) => name === 'name1')).not.to.be.undefined;
        expect(dbs.find(({ name }) => name === 'name2')).not.to.be.undefined;
        expect(dbs.find(({ name }) => name === 'not exists')).to.be.undefined;
      });
    });
  });

  describe('Method insert', () => {
    it('Should insert a tenantry', async () => {
      await autoRollbackTransaction(async (manager: EntityManager) => {
        const plan = getPlan('TEST-PLAN');
        const db = await manager
          .getRepository(Database)
          .save({ name: 'name1', url: 'url1' });
        const inserted = await TenantInfrastructure.getInstance().insert(
          manager,
          'name1',
          'orgName1',
          true,
          db,
          {},
          plan,
        );
        expect(inserted.name).to.be.eq('name1');
        expect(inserted.orgName).to.be.eq('orgName1');
      });
    });
  });
});
