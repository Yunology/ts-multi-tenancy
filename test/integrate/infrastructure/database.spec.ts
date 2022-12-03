// test/integrate/infrastructure/database.spec.ts
import { expect } from 'chai';
import { EntityManager } from 'typeorm';

import { DatabaseInfrastructure, Database } from 'index';

import { autoRollbackTransaction } from '../hook.spec';

describe('Database Infrastructure', () => {
  describe('Method getDatabases', () => {
    it('Should get empty because there is nothing in db', async () => {
      await autoRollbackTransaction(async (manager: EntityManager) => {
        const dbs = await DatabaseInfrastructure.getInstance().getDatabases(
          manager,
        );
        expect(dbs.length).to.be.eq(0);
      });
    });

    it('Should get all databases', async () => {
      await autoRollbackTransaction(async (manager: EntityManager) => {
        await manager
          .getRepository(Database)
          .save({ name: 'name1', url: 'url1' });
        await manager
          .getRepository(Database)
          .save({ name: 'name2', url: 'url2' });

        const dbs = await DatabaseInfrastructure.getInstance().getDatabases(
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
    it('Should insert a database', async () => {
      await autoRollbackTransaction(async (manager: EntityManager) => {
        const inserted = await DatabaseInfrastructure.getInstance().insert(
          manager,
          'test-name',
          'test-url',
        );
        expect(inserted.name).to.be.eq('test-name');
        expect(inserted.url).to.be.eq('test-url');
      });
    });
  });
});
