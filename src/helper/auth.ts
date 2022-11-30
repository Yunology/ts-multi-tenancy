// src/helper/auth.ts
import { Service } from '../service';

let signInValidateFunctionLoadedFlag = false;
let signInValidateFunction = (
  service: Service, ...args: unknown[]
) => Promise.resolve(true);

export function registerSignInValidateFunction(
  validateFunction: (service: Service, ...args: unknown[]) => Promise<boolean>,
): void {
  if (signInValidateFunctionLoadedFlag === true) {
    console.log('Duplicate register may cause override.');
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
      if (signInValidateFunctionLoadedFlag === false) {
        throw new Error(
          'Non of any signInValidateFunction registered,'
          + 'default will pass everything.');
      }
      const result = await signInValidateFunction(this as Service, ...args);
      if (!result) {
        throw new Error('Please login first.');
      }
      return originalMethod.call(this, ...args);
    };

    return descriptor;
  };
}
