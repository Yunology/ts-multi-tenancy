#!/usr/bin/env node
// src/cli.ts
import yargs from 'yargs';

import {
  SystemMigrationCommand, MigrationGenerateCommand,
} from './cli_command';

yargs
  .usage('Usage: $0 <command> [options]')
  .command(new SystemMigrationCommand())
  .command(new MigrationGenerateCommand())
  .recommendCommands()
  .demandCommand(1)
  .strict().argv;
