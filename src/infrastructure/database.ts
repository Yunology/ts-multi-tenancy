// src/infrastructure/database.ts
import { EntityManager } from 'typeorm';

import { InfrastructureManyModifiable } from '@/infrastructure';
import { Database } from '@/entry';

export class DatabaseInfrastructure extends InfrastructureManyModifiable<Database> {
  private static INSTANCE: DatabaseInfrastructure;

  public static async init(): Promise<DatabaseInfrastructure> {
    if (this.INSTANCE === undefined) {
      this.INSTANCE = new DatabaseInfrastructure();
    }

    return this.INSTANCE;
  }

  public static getInstance(): DatabaseInfrastructure {
    return this.INSTANCE;
  }

  constructor() {
    super(Database);
  }

  getManyByIds(manager: EntityManager, ids: number[]): Promise<Array<Database>> {
    throw new Error('Database can not get by ids.');
  }

  public async getDatabases(manager: EntityManager): Promise<Array<Database>> {
    return this.getMany(manager, {});
  }

  public async insert(
    manager: EntityManager,
    name: string,
    url: string,
  ): Promise<Database> {
    const database = new Database();
    database.name = name;
    database.url = url;

    return this.add(manager, database, { name });
  }
}
