// src/cli_command/system_migration_run.ts
import { Arguments, CommandModule } from 'yargs';
import { cwd } from 'process';
import { spawn } from 'child_process';

export class SystemMigrationRunCommand implements CommandModule {
  command = 'run';
  describe = 'Run system migration';

  async handler(_: Arguments) {
    const moduleName = 'node_modules/@yunology/ts-multi-tenancy';
    spawn(
      'yarn',
      [
        'typeorm',
        'migration:run',
        '-d',
        `${cwd()}/${moduleName}/dist/cli_datasource.js`,
      ],
      { stdio: 'inherit' },
    );
  }
}
