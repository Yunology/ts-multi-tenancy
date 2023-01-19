// src/cli_command/typeorm.ts
import { CommandModule, Arguments } from 'yargs';
import { exec } from 'shelljs';
import { cwd } from 'process';

export class SystemMigrtionRunCommand implements CommandModule {
  command = 'migration:system show';

  async handler(args: Arguments) {
    exec(`yarn typeorm migration:show -d $${cwd()}/node_modules/ts-multi-tenancy/dis/cli_datasource.ts`);
  }
}
