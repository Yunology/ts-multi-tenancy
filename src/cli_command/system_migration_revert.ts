// src/cli_command/system_migration_revert.ts
import { Arguments, CommandModule } from 'yargs';
import { exec } from 'shelljs';
import { cwd } from 'process';

export class SystemMigrationRevertCommand implements CommandModule {
  command = 'revert';
  describe = 'Revert system migration';

  async handler(args: Arguments) {
    const moduleName = 'node_modules/@yunology/ts-multi-tenancy';
    exec(`yarn typeorm migration:revert -d ${cwd()}/${moduleName}/dist/cli_datasource.js`);
  }
}
