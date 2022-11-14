// src/controller/tenant.ts
import {
  Body, Controller, Get, Post, Route, Tags,
} from 'tsoa';

import { getTenantService } from '@/index';
import { Database, Tenant } from '@/entry';
import { CreateDatabaseDTO, CreateTenantDTO } from '@/dto';

@Tags('Tenant')
@Route('tenant')
export class TenantController extends Controller {
  @Post('database')
  public async createDatabase(
    @Body() data: CreateDatabaseDTO,
  ): Promise<void> {
    await getTenantService().newDatabase(data);
  }

  @Post()
  public async createTenantry(
    @Body() data: CreateTenantDTO,
  ): Promise<void> {
    if (data.config.govCoce.toString().length !== 6) {
      throw new Error('Config govCode should be 6-digits integer.');
    }
    await getTenantService().new(data);
  }

  @Get('database')
  public async listDatabase(): Promise<Array<Database>> {
    return getTenantService().listDatabases();
  }

  @Get()
  public async listTenantries(): Promise<Array<Tenant>> {
    return getTenantService().listTenantries();
  }
}
