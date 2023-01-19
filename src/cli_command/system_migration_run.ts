// src/cli_command/system_migration_run.ts
import { Arguments, CommandModule } from 'yargs';
import { exec } from 'shelljs';
import { cwd } from 'process';

export class SystemMigrationRunCommand implements CommandModule {
  command = 'run';
  describe = 'Run system migration';

  async handler(_: Arguments) {
    const moduleName = 'node_modules/@yunology/ts-multi-tenancy';
    exec(
      `yarn typeorm migration:run -d ${cwd()}/${moduleName}/dist/cli_datasource.js`,
    );
  }
}
