import { MigrationInterface, QueryRunner } from "typeorm";

export class TenantTablePlanField1667030240831 implements MigrationInterface {
    name = 'TenantTablePlanField1667030240831'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."tenant_plan_enum" AS ENUM('standard')`);
        await queryRunner.query(`ALTER TABLE "tenant" ADD "plan" "public"."tenant_plan_enum" NOT NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "tenant"."plan" IS 'STANDARD: 標準方案'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`COMMENT ON COLUMN "tenant"."plan" IS 'STANDARD: 標準方案'`);
        await queryRunner.query(`ALTER TABLE "tenant" DROP COLUMN "plan"`);
        await queryRunner.query(`DROP TYPE "public"."tenant_plan_enum"`);
    }

}
