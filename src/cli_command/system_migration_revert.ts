// src/cli_command/system_migration_revert.ts
import { Arguments, CommandModule } from 'yargs';
import { cwd } from 'process';
import { spawn } from 'child_process';

export class SystemMigrationRevertCommand implements CommandModule {
  command = 'revert';
  describe = 'Revert system migration';

  async handler(_: Arguments) {
    const moduleName = 'node_modules/@yunology/ts-multi-tenancy';
    spawn(
      'yarn',
      [
        'typeorm',
        'migration:revert',
        '-d',
        `${cwd()}/${moduleName}/dist/cli_datasource.js`,
      ],
      {stdio: 'inherit'},
    );
  }
}
