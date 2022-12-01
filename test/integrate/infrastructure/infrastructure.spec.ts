// test/integrate/infrastructure/infrastructure.spec.ts
import { expect } from 'chai';
import {
  DeepPartial,
  EntityManager,
  FindManyOptions,
  FindOneOptions,
  FindOptionsWhere,
  SaveOptions,
} from 'typeorm';

import {
  Database,
  DeleteResultDTO,
  InfrastructureManyModifiable,
  Tenant,
} from 'index';

import { autoRollbackTransaction } from '../hook.spec';

class TestDatabaseInfrastructure extends InfrastructureManyModifiable<Database> {
  constructor() {
    super(Database);
  }

  getOrNull(
    manager: EntityManager,
    condition: FindOptionsWhere<Database>,
    option?: FindOneOptions<Database>,
  ): Promise<Database | null> {
    return super.getOrNull(manager, condition, option);
  }

  get(
    manager: EntityManager,
    condition: FindOptionsWhere<Database>,
    option?: FindOneOptions<Database>,
  ): Promise<Database> {
    return super.get(manager, condition, option);
  }

  add(
    manager: EntityManager,
    entity: Database,
    condition: FindOptionsWhere<Database>,
    options?: SaveOptions,
  ): Promise<Database> {
    return super.add(manager, entity, condition, options);
  }

  update<E extends DeepPartial<Database>>(
    manager: EntityManager,
    condition: FindOneOptions<Database> | FindOptionsWhere<Database>,
    entity: E,
    options?: SaveOptions,
  ): Promise<Database> {
    return super.update(manager, condition, entity, options);
  }

  delete(
    manager: EntityManager,
    condition: FindOptionsWhere<Database>,
  ): Promise<DeleteResultDTO> {
    return super.delete(manager, condition);
  }

  getMany(
    manager: EntityManager,
    condition: FindOptionsWhere<Database> | FindOptionsWhere<Database>[],
    options?: FindManyOptions<Database>,
  ): Promise<Array<Database>> {
    return super.getMany(manager, condition, options);
  }
}

describe('Infrastructure base class', () => {
  describe('Method repo', () => {
    it('Should get repo without optional class', async () => {
      await autoRollbackTransaction(async (manager: EntityManager) => {
        const repo = new TestDatabaseInfrastructure().repo(manager);
        expect(repo.target).to.be.eq(Database);
      });
    });

    it('Should get repo with optional class', async () => {
      await autoRollbackTransaction(async (manager: EntityManager) => {
        const repo = new TestDatabaseInfrastructure().repo(manager, Tenant);
        expect(repo.target).to.be.eq(Tenant);
      });
    });
  });

  describe('Method getOrNull', () => {
    it('Should get null because is not find', async () => {
      await autoRollbackTransaction(async (manager: EntityManager) => {
        const found = await new TestDatabaseInfrastructure().getOrNull(
          manager,
          { name: 'not-exists' },
        );
        expect(found).to.be.null;
      });
    });

    it('Should get one', async () => {
      await autoRollbackTransaction(async (manager: EntityManager) => {
        await manager.getRepository(Database).save({
          name: 'exists',
          url: 'exists-url',
        });
        const found = await new TestDatabaseInfrastructure().getOrNull(
          manager,
          { name: 'exists' },
        );
        expect(found).not.to.be.null;
        expect(found!.name).to.be.eq('exists');
        expect(found!.url).to.be.eq('exists-url');
      });
    });
  });

  describe('Method get', () => {
    it('Should raise error because given condition is not found', async () => {
      await autoRollbackTransaction(async (manager: EntityManager) => {
        const condition = { name: 'not-exists' };
        await expect(
          new TestDatabaseInfrastructure().get(manager, condition),
        ).to.eventually.rejectedWith(
          Error,
          'No such entry with given condition' +
            ` ${JSON.stringify(condition)} exists.`,
        );
      });
    });

    it('Should get one', async () => {
      await autoRollbackTransaction(async (manager: EntityManager) => {
        await manager.getRepository(Database).save({
          name: 'exists',
          url: 'exists-url',
        });
        const found = await new TestDatabaseInfrastructure().get(manager, {
          name: 'exists',
        });
        expect(found).not.to.be.null;
        expect(found!.name).to.be.eq('exists');
        expect(found!.url).to.be.eq('exists-url');
      });
    });
  });

  describe('Method add', () => {
    it('Should raise error because such entity already exists', async () => {
      await autoRollbackTransaction(async (manager: EntityManager) => {
        await manager.getRepository(Database).save({
          name: 'already-exists',
          url: 'exists-url',
        });
        await expect(
          new TestDatabaseInfrastructure().add(
            manager,
            { name: '', url: '' } as Database,
            { name: 'already-exists' },
          ),
        ).to.eventually.rejectedWith(Error, 'Such entity already exists.');
      });
    });
  });

  describe('Method update', () => {
    it('Should raise error because such entity not exists', async () => {
      await autoRollbackTransaction(async (manager: EntityManager) => {
        await expect(
          new TestDatabaseInfrastructure().update(
            manager,
            { name: 'not-exists' },
            { name: 'exists', url: 'url' } as Database,
          ),
        ).to.eventually.rejectedWith(Error, '');
      });
    });

    it('Should update given entity with FindOneOptions', async () => {
      await autoRollbackTransaction(async (manager: EntityManager) => {
        const db = await manager.getRepository(Database).save({
          name: 'exists',
          url: 'exists-url',
        });
        const updated = await new TestDatabaseInfrastructure().update(
          manager,
          { id: db.id },
          { name: 'another-name', url: 'another-url' } as Database,
        );
        expect(updated).not.to.be.undefined;
        expect((updated as any).where).to.be.undefined;
        expect(updated.name).to.be.eq('another-name');
        expect(updated.url).to.be.eq('another-url');
      });
    });

    it('Should update given entity with FindOptionsWhere', async () => {
      await autoRollbackTransaction(async (manager: EntityManager) => {
        const db = await manager.getRepository(Database).save({
          name: 'exists',
          url: 'exists-url',
        });
        const updated = await new TestDatabaseInfrastructure().update(
          manager,
          { where: { id: db.id } },
          { name: 'another-name', url: 'another-url' } as Database,
        );
        expect(updated).not.to.be.undefined;
        expect(updated.name).to.be.eq('another-name');
        expect(updated.url).to.be.eq('another-url');
      });
    });
  });

  describe('Method delete', () => {
    it('Should raise error because such entity not exists', async () => {
      await autoRollbackTransaction(async (manager: EntityManager) => {
        const condition = { name: 'not-exists' };
        await expect(
          new TestDatabaseInfrastructure().delete(manager, condition),
        ).to.eventually.rejectedWith(
          Error,
          `No such entry with condition ${JSON.stringify(condition)} exists.`,
        );
      });
    });

    it('Should delete given entity', async () => {
      await autoRollbackTransaction(async (manager: EntityManager) => {
        const db = await manager.getRepository(Database).save({
          name: 'exists',
          url: 'exists-url',
        });
        const deleted = await new TestDatabaseInfrastructure().delete(
          manager,
          {
            id: db.id,
          },
        );
        expect(deleted.success).to.be.true;
      });
    });
  });

  describe('Method getMany', () => {
    it('Should get many with given condition', async () => {
      await autoRollbackTransaction(async (manager: EntityManager) => {
        const db1 = await manager.getRepository(Database).save({
          name: 'db1',
          url: 'exists-url',
        });
        const db2 = await manager.getRepository(Database).save({
          name: 'db2',
          url: 'exists-url',
        });
        const db3 = await manager.getRepository(Database).save({
          name: 'db3',
          url: 'exists-url',
        });
        const dbs = await new TestDatabaseInfrastructure().getMany(manager, {
          url: 'exists-url',
        });
        expect(dbs.length).to.be.eq(3);
        expect(dbs.find(({ name }) => name === 'db1')).not.to.be.undefined;
        expect(dbs.find(({ name }) => name === 'db2')).not.to.be.undefined;
        expect(dbs.find(({ name }) => name === 'db3')).not.to.be.undefined;
        expect(dbs.find(({ url }) => url !== 'exists-url')).to.be.undefined;
      });
    });
  });
});
