// src/helper/permission.ts
import { Permission } from 'entry';
import { Service } from 'service';

let permissionValidateFunctionLoadedFlag = false;
let permissionValidateFunction: Function = () => true;

export function registerPermissionValidateFunction(
  validateFunction: (
    service: Service, permission: Permission, ...args: unknown[]
  ) => Promise<boolean>,
): void {
  if (permissionValidateFunctionLoadedFlag === true) {
    console.log('Duplicate register may cause override.');
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
      if (permissionValidateFunctionLoadedFlag === false) {
        throw new Error(
          'Non of any permissionValidateFunction registered,'
          + 'default will pass everything.');
      }
      const result = await permissionValidateFunction(this, permission, ...args);
      if (!result) {
        throw new Error('No permission.');
      }

      return originalMethod.call(this, ...args);
    };

    return descriptor;
  };
}
