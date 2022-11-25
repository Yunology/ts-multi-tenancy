import { MigrationInterface, QueryRunner } from "typeorm";

export class BaseEntityIdField1668675504073 implements MigrationInterface {
    name = 'BaseEntityIdField1668675504073'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tenant" DROP CONSTRAINT "FK_5a52e06e03d81166ab1d331fea5"`);
        await queryRunner.query(`ALTER TABLE "database" ADD "id" uuid NOT NULL DEFAULT uuid_generate_v4()`);
        await queryRunner.query(`ALTER TABLE "database" DROP CONSTRAINT "PK_d6f2a8fbd37e49015928687bdc8"`);
        await queryRunner.query(`ALTER TABLE "database" ADD CONSTRAINT "PK_486f32fd98aad34a3d9073b43dd" PRIMARY KEY ("name", "url", "id")`);
        await queryRunner.query(`ALTER TABLE "tenant" ADD "id" uuid NOT NULL DEFAULT uuid_generate_v4()`);
        await queryRunner.query(`ALTER TABLE "tenant" DROP CONSTRAINT "PK_dbd58dde83f10aef57187658aca"`);
        await queryRunner.query(`ALTER TABLE "tenant" ADD CONSTRAINT "PK_5782563cffee995e1885aba0d57" PRIMARY KEY ("name", "org_name", "id")`);
        await queryRunner.query(`ALTER TABLE "tenant" ADD "databaseId" uuid`);
        await queryRunner.query(`ALTER TABLE "tenant" ADD CONSTRAINT "FK_5117dd693d15ab80eb889c6f68b" FOREIGN KEY ("databaseId", "databaseName", "databaseUrl") REFERENCES "database"("id","name","url") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tenant" DROP CONSTRAINT "FK_5117dd693d15ab80eb889c6f68b"`);
        await queryRunner.query(`ALTER TABLE "tenant" DROP COLUMN "databaseId"`);
        await queryRunner.query(`ALTER TABLE "tenant" DROP CONSTRAINT "PK_5782563cffee995e1885aba0d57"`);
        await queryRunner.query(`ALTER TABLE "tenant" ADD CONSTRAINT "PK_dbd58dde83f10aef57187658aca" PRIMARY KEY ("name", "org_name")`);
        await queryRunner.query(`ALTER TABLE "tenant" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "database" DROP CONSTRAINT "PK_486f32fd98aad34a3d9073b43dd"`);
        await queryRunner.query(`ALTER TABLE "database" ADD CONSTRAINT "PK_d6f2a8fbd37e49015928687bdc8" PRIMARY KEY ("name", "url")`);
        await queryRunner.query(`ALTER TABLE "database" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "tenant" ADD CONSTRAINT "FK_5a52e06e03d81166ab1d331fea5" FOREIGN KEY ("databaseName", "databaseUrl") REFERENCES "database"("name","url") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
