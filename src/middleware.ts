// src/middleware.ts
import { Request, Response, NextFunction } from 'express';
import { isUndefined } from 'lodash';

import { getTenantService } from '.';

export function tenantMiddleware(
  req: Request, res: Response, next: NextFunction,
) {
  const origin = req.originalUrl;
  const tenantService = getTenantService();
  const header = req.header(tenantService.tenantHeaderName);
  const tenant = tenantService.get(header);
  if (isUndefined(tenant)) {
    throw new Error('Unknown Tenant.');
  } else if (!tenant.isAllowDomain(origin)){
    throw new Error('Unaccepted origin.');
  } else {
    req.tenant = tenant;
    next();
  }
}
