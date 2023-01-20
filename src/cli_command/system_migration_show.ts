// src/cli_command/system_migration_show.ts
import { Arguments, CommandModule } from 'yargs';
import { cwd } from 'process';
import { spawn } from 'child_process';

export class SystemMigrationShowCommand implements CommandModule {
  command = 'show';
  describe = 'Show system migration';

  async handler(_: Arguments) {
    const moduleName = 'node_modules/@yunology/ts-multi-tenancy';
    spawn(
      'yarn',
      [
        'typeorm',
        'migration:show',
        '-d',
        `${cwd()}/${moduleName}/dist/cli_datasource.js`,
      ],
      {stdio: 'inherit'},
    );
  }
}
