#!/usr/bin/env node
// src/cli.ts
import yargs from 'yargs';

import { SystemMigrtionRunCommand } from './cli_command/system_migration_show';

yargs
  .usage('Usage: $0 <command> [options]')
  .command(new SystemMigrtionRunCommand())
  .recommendCommands()
  .demandCommand(1)
  .strict().argv;
