import { MigrationInterface, QueryRunner } from "typeorm";

export class TenantInit1668658417786 implements MigrationInterface {
    name = 'TenantInit1668658417786'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "database" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "name" character varying NOT NULL, "url" character varying NOT NULL, CONSTRAINT "PK_d6f2a8fbd37e49015928687bdc8" PRIMARY KEY ("name", "url"))`);
        await queryRunner.query(`CREATE TABLE "tenant" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "name" character varying NOT NULL, "org_name" character varying NOT NULL, "activate" boolean NOT NULL DEFAULT false, "config" json NOT NULL DEFAULT '{}', "plan" character varying NOT NULL, "databaseName" character varying, "databaseUrl" character varying, CONSTRAINT "PK_dbd58dde83f10aef57187658aca" PRIMARY KEY ("name", "org_name"))`);
        await queryRunner.query(`ALTER TABLE "tenant" ADD CONSTRAINT "FK_5a52e06e03d81166ab1d331fea5" FOREIGN KEY ("databaseName", "databaseUrl") REFERENCES "database"("name","url") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tenant" DROP CONSTRAINT "FK_5a52e06e03d81166ab1d331fea5"`);
        await queryRunner.query(`DROP TABLE "tenant"`);
        await queryRunner.query(`DROP TABLE "database"`);
    }

}
