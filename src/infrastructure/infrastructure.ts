// src/infrastructure/infrastructure.ts
/* eslint-disable max-classes-per-file */
import {
  DeepPartial, FindOptionsWhere, FindManyOptions,
  FindOneOptions, SaveOptions, Repository, ObjectLiteral,
  FindOptionsUtils, EntityManager, EntityTarget,
} from 'typeorm';
import { isUndefined, omitBy } from 'lodash';

import { DeleteResultDTO, filterDeleteResult } from '@/dto';

/**
 * Basic Infrastructure
 *
 * This class responsible controll CRUD detail with typeorm.
 * And this class only have ability to get or add entities into database.
 * With complete modificapability, please @see InfrastructureModifiable .
 *
 * @see Infrastructure<T> only get and add function.
 * @see InfrastrcutureModifiable<T> CRUD function.
 * @see InfrastructureManyModififiable<T> CRUD and interact with multiple entries.
 * There is no InfrastructureMany<T> to provide get, add, multiple entries.
 *
 * @author Clooooode
 */
export abstract class Infrastructure<T extends ObjectLiteral> {
  t: EntityTarget<T>;

  constructor(clazz: EntityTarget<T>) {
    this.t = clazz;
  }

  public get repo(): (manager: EntityManager, clazz?: EntityTarget<T>) => Repository<T> {
    return (manager: EntityManager, clazz?: EntityTarget<T>) => manager.getRepository(
      clazz || this.t,
    );
  }

  protected getOrNull(
    manager: EntityManager,
    condition: FindOptionsWhere<T>,
    option?: FindOneOptions<T>,
  ): Promise<T | null> {
    return this.repo(manager).findOne({
      ...option,
      where: condition,
    });
  }

  protected async get(
    manager: EntityManager,
    condition: FindOptionsWhere<T>,
    option?: FindOneOptions<T>,
  ): Promise<T> {
    const t: T | null = await this.getOrNull(manager, condition, option);

    if (t === null) {
      throw new Error(`No such entry with given condition ${JSON.stringify(condition)} exists.`);
    }
    return t;
  }

  protected async add(
    manager: EntityManager,
    entity: T,
    condition?: FindOptionsWhere<T>,
    options?: SaveOptions,
  ): Promise<T> {
    if (condition !== undefined && await this.repo(manager).countBy(condition) !== 0) {
      throw new Error('Such entity already exists.');
    }
    return this.repo(manager).save(entity, options);
  }
}

/**
 * InfrastructureModifiable base on Infrastructure, have tow more methods,
 * update and delete, to provide full CRUD function to database through typeorm.
 *
 * Ability to access multiple entries at same time, please @see InfrastructureManyModifiable .
 *
 * @see Infrastructure<T> only get and add function.
 * @see InfrastrcutureModifiable<T> CRUD function.
 * @see InfrastructureManyModififiable<T> CRUD and interact with multiple entries.
 * There is no InfrastructureMany<T> to provide get, add, multiple entries.
 *
 * @author Clooooode
 */
export abstract class InfrastructureModifiable<T extends ObjectLiteral> extends Infrastructure<T> {
  protected async update<E extends DeepPartial<T>>(
    manager: EntityManager,
    condition: FindOneOptions<T> | FindOptionsWhere<T>,
    entity: E,
    options?: SaveOptions,
  ): Promise<T> {
    const findCondition = FindOptionsUtils.isFindOneOptions(condition)
      ? condition : { where: condition };
    // TODO: https://github.com/typeorm/typeorm/issues/3490  TypeORM sucks!
    const findEntity: T | null = await this.repo(manager).findOne(findCondition);
    if (findEntity === null) {
      throw new Error('Such entitiy not exists.');
    }
    return this.repo(manager).save({
      ...(findCondition.where ? findCondition.where : findCondition),
      ...findEntity,
      ...omitBy(entity, isUndefined),
    }, options);
  }

  protected async delete(
    manager: EntityManager,
    condition: FindOptionsWhere<T>,
  ): Promise<DeleteResultDTO> {
    if (await this.repo(manager).countBy(condition) === 0) {
      throw new Error(`No such entry with condition ${JSON.stringify(condition)} exists.`);
    }

    return filterDeleteResult(await this.repo(manager).delete(condition));
  }
}

/**
 * InfrastructureManyModifiable base on InfrastructureModifiable,
 * add getMany and getManyByIds method to interact with multiple entries.
 *
 * @see Infrastructure<T> only get and add function.
 * @see InfrastrcutureModifiable<T> CRUD function.
 * @see InfrastructureManyModififiable<T> CRUD and interact with multiple entries.
 * There is no InfrastructureMany<T> to provide get, add, multiple entries.
 *
 * @author Clooooode
 */
export abstract class InfrastructureManyModifiable<T extends ObjectLiteral>
  extends InfrastructureModifiable<T> {
  protected async getMany(
    manager: EntityManager,
    condition: FindOptionsWhere<T> | FindOptionsWhere<T>[],
    options?: FindManyOptions<T>,
  ): Promise<Array<T>> {
    return this.repo(manager).find({ ...options, where: condition });
  }

  abstract getManyByIds(manager: EntityManager, ids: Array<number>): Promise<Array<T>>;
}
