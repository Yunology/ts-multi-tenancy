// src/module/standard/entry/ormresult.ts
import { DeleteResult, UpdateResult } from 'typeorm';

import { APIResult } from './api';

export type DeleteResultDTO = APIResult & ({
  success: true,
} | {
  success: false,
  message: string,
});

export type UpdateResultDTO = DeleteResultDTO;

export function filterUpdateResult(result: UpdateResult): UpdateResultDTO {
  const success = result.raw.affectedRows >= 1;

  return success ? {
    success,
  } : {
    success,
    message: '',
  };
}

export function filterDeleteResult(result: DeleteResult): DeleteResultDTO {
  const success = result.affected !== undefined && result.affected !== null && result.affected >= 1;

  return success ? {
    success,
  } : {
    success,
    message: '',
  };
}
