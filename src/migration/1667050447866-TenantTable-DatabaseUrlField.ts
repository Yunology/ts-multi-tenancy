import { MigrationInterface, QueryRunner } from "typeorm";

export class TenantTableDatabaseUrlField1667050447866 implements MigrationInterface {
    name = 'TenantTableDatabaseUrlField1667050447866'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tenant" DROP CONSTRAINT "CHK_515b37428f818a7d2885bd58ef"`);
        await queryRunner.query(`ALTER TABLE "tenant" DROP COLUMN "database_host"`);
        await queryRunner.query(`ALTER TABLE "tenant" DROP COLUMN "database_port"`);
        await queryRunner.query(`ALTER TABLE "tenant" DROP COLUMN "is_dedicated_database"`);
        await queryRunner.query(`ALTER TABLE "tenant" ADD "database_url" character varying NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tenant" DROP COLUMN "database_url"`);
        await queryRunner.query(`ALTER TABLE "tenant" ADD "is_dedicated_database" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "tenant" ADD "database_port" smallint`);
        await queryRunner.query(`ALTER TABLE "tenant" ADD "database_host" character varying`);
        await queryRunner.query(`ALTER TABLE "tenant" ADD CONSTRAINT "CHK_515b37428f818a7d2885bd58ef" CHECK (((is_dedicated_database IS FALSE) OR ((database_host IS NOT NULL) AND (database_port IS NOT NULL))))`);
    }

}
