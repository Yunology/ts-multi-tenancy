import { MigrationInterface, QueryRunner } from "typeorm";

export class TenantTableDatabaseField1667111877341 implements MigrationInterface {
    name = 'TenantTableDatabaseField1667111877341'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "database" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "name" character varying NOT NULL, "url" character varying NOT NULL, CONSTRAINT "PK_f10da306175aaea87ff4a1981db" PRIMARY KEY ("name", "url"))`);
        await queryRunner.query(`ALTER TABLE "tenant" DROP COLUMN "database_url"`);
        await queryRunner.query(`ALTER TABLE "tenant" ADD "databaseName" character varying`);
        await queryRunner.query(`ALTER TABLE "tenant" ADD "databaseUrl" character varying`);
        await queryRunner.query(`ALTER TABLE "tenant" ADD CONSTRAINT "FK_5a52e06e03d81166ab1d331fea5" FOREIGN KEY ("databaseName", "databaseUrl") REFERENCES "database"("name","url") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tenant" DROP CONSTRAINT "FK_5a52e06e03d81166ab1d331fea5"`);
        await queryRunner.query(`ALTER TABLE "tenant" DROP COLUMN "databaseUrl"`);
        await queryRunner.query(`ALTER TABLE "tenant" DROP COLUMN "databaseName"`);
        await queryRunner.query(`ALTER TABLE "tenant" ADD "database_url" character varying NOT NULL`);
        await queryRunner.query(`DROP TABLE "database"`);
    }

}
