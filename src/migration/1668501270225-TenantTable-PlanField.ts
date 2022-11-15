import { MigrationInterface, QueryRunner } from "typeorm";

export class TenantTablePlanField1668501270225 implements MigrationInterface {
    name = 'TenantTablePlanField1668501270225'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tenant" DROP COLUMN "plan"`);
        await queryRunner.query(`DROP TYPE "public"."tenant_plan_enum"`);
        await queryRunner.query(`ALTER TABLE "tenant" ADD "plan" character varying NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tenant" DROP COLUMN "plan"`);
        await queryRunner.query(`CREATE TYPE "public"."tenant_plan_enum" AS ENUM('standard')`);
        await queryRunner.query(`ALTER TABLE "tenant" ADD "plan" "public"."tenant_plan_enum" NOT NULL`);
    }

}
