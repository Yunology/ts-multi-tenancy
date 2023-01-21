// src/helper/permission.ts
import { Permission, RuntimeTenant } from '../entry';
import { PermissionTree, Service } from '../service';

let permissionValidateFunctionLoadedFlag = false;
let permissionValidateFunction = (
  service: Service,
  permission: Permission,
  ...args: unknown[]
) => Promise.resolve(true);

export function registerPermissionValidateFunction(
  validateFunction: (
    service: Service,
    permission: Permission,
    ...args: unknown[]
  ) => Promise<boolean>,
): void {
  if (permissionValidateFunctionLoadedFlag === true) {
    console.log('Duplicate register may cause override.');
  }
  permissionValidateFunctionLoadedFlag = true;
  permissionValidateFunction = validateFunction;
}

export function filterInvalidPermission(
  targetPermissions: Array<Permission>,
  test: Array<number>,
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

export function SetupPermission<P extends PermissionTree>(permission: P): ClassDecorator {
  return (target: any) => {
    if (!(new target() instanceof Service)) {
      throw new Error(`SetupPermission can only use at Service's child classes.`);
    }

    const toSetPermission = Reflect.hasMetadata('permission', target)
      ? { ...Reflect.getMetadata('permission', target), ...permission }
      : permission;
    Reflect.defineMetadata('permission', toSetPermission, target);
  };
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
          'Non of any permissionValidateFunction registered,' +
            'default will pass everything.',
        );
      }
      const result = await permissionValidateFunction(
        this as Service,
        permission,
        ...args,
      );
      if (!result) {
        throw new Error('No permission.');
      }

      return originalMethod.call(this, ...args);
    };

    return descriptor;
  };
}

export function injectPermissionToRuntimeTenant(
  serviceConstructor: Function,
  rt: RuntimeTenant,
): void {
  rt.insertPermission(Reflect.getMetadata('permission', serviceConstructor) as Record<string, Permission>);
}
