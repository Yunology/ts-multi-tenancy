// src/cli_command/system_migration.ts
import { Argv, Arguments, CommandModule } from 'yargs';

import { SystemMigrationShowCommand } from './system_migration_show';
import { SystemMigrationRunCommand } from './system_migration_run';
import { SystemMigrationRevertCommand } from './system_migration_revert';

export class SystemMigrationCommand implements CommandModule {
  command = 'migration:system';
  describe = 'Migration commands for ts-multi-tenancy';

  builder(args: Argv) {
    return args
      .usage('Usage: $0 <command> [options]')
      .command(new SystemMigrationShowCommand())
      .command(new SystemMigrationRunCommand())
      .command(new SystemMigrationRevertCommand());
  }

  handler(_: Arguments): void | Promise<void> {}
}
