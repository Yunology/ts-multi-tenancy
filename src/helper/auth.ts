// src/helper/auth.ts
import { Service } from '../service';
import { RuntimeTenant } from '../entry';
import { TenantError } from '../error';
import { logger } from '../log';

let signInValidateFunctionLoadedFlag = false;
let signInValidateFunction: (
  service: Service, ...args: unknown[],
) => Promise<{
  tenant: RuntimeTenant; result: boolean;
}>;

export function registerSignInValidateFunction(
  validateFunction: (service: Service, ...args: unknown[]) => Promise<{
    tenant: RuntimeTenant; result: boolean;
  }>,
): void {
  if (signInValidateFunctionLoadedFlag) {
    logger.warn('Duplicate register may cause override.');
  }
  signInValidateFunctionLoadedFlag = true;
  signInValidateFunction = validateFunction;
}

export function SignInRequire() {
  return (
    target: unknown,
    methodName: string | symbol,
    descriptor: PropertyDescriptor,
  ): PropertyDescriptor => {
    const originalMethod = descriptor.value;

    // eslint-disable-next-line no-param-reassign
    descriptor.value = async function _(...args: unknown[]) {
      if (signInValidateFunctionLoadedFlag) {
        const { tenant, result } = await signInValidateFunction(
          this as Service, ...args,
        );
        if (!result) {
          throw new TenantError(tenant, 'Please login first.');
        }
      } else {
        logger.warn(
          'Non of any signInValidateFunction registered,'
          + 'default will pass everything.');
      }
      return originalMethod.call(this, ...args);
    };

    return descriptor;
  };
}
