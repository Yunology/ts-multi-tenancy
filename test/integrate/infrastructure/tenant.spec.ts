// test/integrate/infrastructure/tenant.spec.ts
import { expect } from 'chai';
import { v4 } from 'uuid';
import { EntityManager } from 'typeorm';

import { Database, getPlan, Tenant, TenantInfrastructure } from 'index';

import { conn } from '../hook.spec';

describe('Tenant Infrastructure', () => {
  describe('Method getById', () => {
    it('Should raise error because getting not exists tenant', async () => {
      await conn.autoRollbackSerialTran(async (manager) => {
        const notExistsId = v4();

        await expect(
          TenantInfrastructure.getInstance().getById(manager, notExistsId),
        ).to.be.rejectedWith(
          Error,
          `No such entry with given condition {"id":"${notExistsId}"} exists.`
        );
      });
    });

    it('Should get one tenant', async () => {
      await conn.autoRollbackSerialTran(async (manager: EntityManager) => {
        const plan = getPlan(conn.getPlanName);
        const id = v4();

        await expect(
          TenantInfrastructure.getInstance().getById(manager, id),
        ).to.be.rejectedWith(
          Error,
          `No such entry with given condition {"id":"${id}"} exists.`
        );

        await manager.getRepository(Tenant).save({
          id,
          name: 'name',
          orgName: 'orgName',
          activate: false,
          plan,
        });
        const getByIdResult = await TenantInfrastructure.getInstance().getById(manager, id);
        expect(getByIdResult.id).to.be.eq(id)
      });
    });
  });

  describe('Method getTenantries', () => {
    it('Should get all tenantriess', async () => {
      await conn.autoRollbackSerialTran(async (manager: EntityManager) => {
        const plan = getPlan(conn.getPlanName);
        const originTenantries = await TenantInfrastructure.getInstance().getTenantries(
          manager,
        );
        const db = await manager
          .getRepository(Database)
          .save({ name: 'name1', url: 'url1' });
        await manager.getRepository(Tenant).save({
          name: 'name1',
          orgName: 'orgName1',
          activate: true,
          config: { database: db.id },
          plan,
        });
        await manager.getRepository(Tenant).save({
          name: 'name2',
          orgName: 'orgName2',
          activate: true,
          config: { database: db.id },
          plan,
        });

        const tenantries = await TenantInfrastructure.getInstance().getTenantries(
          manager,
        );
        expect(tenantries.length).to.be.eq(originTenantries.length + 2);
        expect(tenantries.find(({ name }) => name === 'name1')).not.to.be.undefined;
        expect(tenantries.find(({ name }) => name === 'name2')).not.to.be.undefined;
        expect(tenantries.find(({ name }) => name === 'not exists')).to.be.undefined;
      });
    });
  });

  describe('Method insert', () => {
    it('Should insert a tenantry', async () => {
      await conn.autoRollbackSerialTran(async (manager: EntityManager) => {
        const plan = getPlan(conn.getPlanName);
        const db = await manager
          .getRepository(Database)
          .save({ name: 'name1', url: 'url1' });
        const inserted = await TenantInfrastructure.getInstance().insert(
          manager,
          'name1',
          'orgName1',
          true,
          { database: db.id },
          plan,
        );
        expect(inserted.name).to.be.eq('name1');
        expect(inserted.orgName).to.be.eq('orgName1');
      });
    });
  });
});
