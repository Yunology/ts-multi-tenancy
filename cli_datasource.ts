// cli_datasource.ts
import { config } from 'dotenv';
import { DataSource } from 'typeorm';
import {
  createDataSource, createSystemDataSource, getPlan,
} from '.';

config({ path: `.env.${process.env.ENV_NAME}` });

const { env } = process;
const { DB_NAME, PLAN_NAME, DB_URL } = env;

let dataSource: DataSource;
if (DB_NAME === 'system') {
  dataSource = createSystemDataSource(DB_URL!);
} else {
  const { entries, migrations } = getPlan(PLAN_NAME!);
  dataSource = createDataSource(
    DB_NAME!, PLAN_NAME!, {
      url: DB_URL!,
      entities: entries,
      migrations,
    },
  );
}

export default dataSource;
