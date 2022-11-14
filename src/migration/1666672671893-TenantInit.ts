import { MigrationInterface, QueryRunner } from "typeorm";

export class TenantInit1666672671893 implements MigrationInterface {
    name = 'TenantInit1666672671893'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "tenant" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "name" character varying NOT NULL, "org_name" character varying NOT NULL, "activate" boolean NOT NULL DEFAULT false, "database_host" character varying, "database_port" smallint, "is_dedicated_database" boolean NOT NULL DEFAULT false, CONSTRAINT "CHK_515b37428f818a7d2885bd58ef" CHECK ("is_dedicated_database" IS FALSE OR ("database_host" IS NOT NULL AND "database_port" IS NOT NULL)), CONSTRAINT "PK_dbd58dde83f10aef57187658aca" PRIMARY KEY ("name", "org_name"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "tenant"`);
    }

}
