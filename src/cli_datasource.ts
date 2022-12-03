// src/cli_datasource.ts
import { config } from 'dotenv';
import { DataSource } from 'typeorm';

import { createSystemDataSource } from './datasource';

config({ path: `.env.${process.env.ENV_NAME}` });

const { env } = process;
const { DB_URL } = env;

const dataSource: DataSource = createSystemDataSource(DB_URL!);

export default dataSource;
