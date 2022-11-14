import { MigrationInterface, QueryRunner } from "typeorm";

export class TenantTableConfigField1666798005898 implements MigrationInterface {
    name = 'TenantTableConfigField1666798005898'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tenant" ADD "config" json NOT NULL DEFAULT '{}'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tenant" DROP COLUMN "config"`);
    }

}
