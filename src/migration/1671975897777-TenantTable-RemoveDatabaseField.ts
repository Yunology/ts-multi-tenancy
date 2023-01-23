import { MigrationInterface, QueryRunner } from "typeorm";

export class TenantTableRemoveDatabaseField1671975897777 implements MigrationInterface {
    name = 'TenantTableRemoveDatabaseField1671975897777'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tenant" DROP CONSTRAINT "FK_5117dd693d15ab80eb889c6f68b"`);
        await queryRunner.query(`ALTER TABLE "tenant" DROP COLUMN "databaseName"`);
        await queryRunner.query(`ALTER TABLE "tenant" DROP COLUMN "databaseUrl"`);
        await queryRunner.query(`ALTER TABLE "tenant" DROP COLUMN "databaseId"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tenant" ADD "databaseId" uuid`);
        await queryRunner.query(`ALTER TABLE "tenant" ADD "databaseUrl" character varying`);
        await queryRunner.query(`ALTER TABLE "tenant" ADD "databaseName" character varying`);
        await queryRunner.query(`ALTER TABLE "tenant" ADD CONSTRAINT "FK_5117dd693d15ab80eb889c6f68b" FOREIGN KEY ("databaseId", "databaseName", "databaseUrl") REFERENCES "database"("id","name","url") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
