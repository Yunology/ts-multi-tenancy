// src/helper/index.ts
export * from './auth';
export * from './config';
export * from './permission';

export type HelperParameter<C> = {
  configs?: C,
};
