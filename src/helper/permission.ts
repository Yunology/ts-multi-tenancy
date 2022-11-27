// src/helper/permission.ts
import { Service } from '../service';
import { Permission, RuntimeTenant } from '../entry';
import { TenantError } from '../error';
import { logger } from '../log';

let permissionValidateFunctionLoadedFlag = false;
let permissionValidateFunction: (
  service: Service, permission: Permission, ...args: unknown[]
) => Promise<{
  tenant: RuntimeTenant; result: boolean;
}>;

export function registerPermissionValidateFunction(
  validateFunction: (
    service: Service, permission: Permission, ...args: unknown[]
  ) => Promise<{
    tenant: RuntimeTenant; result: boolean;
  }>,
): void {
  if (permissionValidateFunctionLoadedFlag) {
    logger.warn('Duplicate register may cause override.');
  }
  permissionValidateFunctionLoadedFlag = true;
  permissionValidateFunction = validateFunction;
}

export function filterInvalidPermission(
  targetPermissions: Array<Permission>, test: Array<number>,
): Array<number> {
  return test.filter((each) => {
    for (const every of targetPermissions) {
      if (every.index === each) {
        return false;
      }
    }
    return true;
  });
}

export function PermissionRequire(permission: Permission) {
  return (
    target: unknown,
    methodName: string | symbol,
    descriptor: PropertyDescriptor,
  ): PropertyDescriptor => {
    const originalMethod = descriptor.value;

    // eslint-disable-next-line no-param-reassign
    descriptor.value = async function _(...args: unknown[]) {
      if (permissionValidateFunctionLoadedFlag) {
        const { tenant, result} = await permissionValidateFunction(
          this as Service, permission, ...args,
        );
        if (!result) {
          throw new TenantError(tenant, 'No permission.');
        }
      } else {
        logger.warn(
          'Non of any permissionValidateFunction registered,'
          + 'default will pass everything.');
      }
      return originalMethod.call(this, ...args);
    };

    return descriptor;
  };
}
