// src/middleware/tenant.ts
import { Request, Response, NextFunction } from 'express';

import { TenantService } from '@/service';

export function tenantMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
  tenantService: TenantService,
) {
  const tenantId = req.header('X-TENANT-ID');
  req.tenant = tenantService.get(tenantId);
  next();
}
