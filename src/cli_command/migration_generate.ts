// src/cli_command/migration_generate.ts
import { Arguments, Argv, CommandModule } from 'yargs';
import { exec } from 'shelljs';

export class MigrationGenerateCommand implements CommandModule {
  moduleName = 'node_modules/@yunology/ts-multi-tenancy';
  command = 'migration:generate';
  describe = 'Generate migration';

  builder(args: Argv) {
    return args
      .option('dataSource', {
        alias: 'd',
        type: 'string',
        describe:
          'Path to the file where your DataSource instance is defined.',
        demandOption: true,
      })
      .option('dr', {
        alias: 'dryrun',
        type: 'boolean',
        default: false,
        describe:
          'Prints out the contents of the migration instead of writing it to a file',
      })
      .option('t', {
        alias: 'timestamp',
        type: 'number',
        default: false,
        describe: 'Custom timestamp for the migration name',
      });
  }

  async handler(args: Arguments) {
    let cmd = `yarn typeorm migration:show -d ${args.dataSource}`;
    if (args.dr) {
      cmd += ` --dr`;
    }
    if (args.t) {
      cmd += ` -t ${args.t}`;
    }
    exec(cmd);
  }
}
