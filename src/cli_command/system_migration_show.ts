// src/cli_command/typeorm.ts
import { CommandModule, Arguments } from 'yargs';
import { exec } from 'shelljs';
import { cwd } from 'process';

export class SystemMigrtionRunCommand implements CommandModule {
  moduleName = 'node_modules/@yunology/ts-multi-tenancy';
  command = 'migration:system show';
  describe = 'Show system migration';

  async handler(args: Arguments) {
    exec(`yarn typeorm migration:show -d ${cwd()}/${this.moduleName}/dist/cli_datasource.js`);
  }
}
