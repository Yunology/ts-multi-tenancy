// src/helper/config.ts
import isUndefined from 'lodash/isUndefined';

import { ConfigTree, Service } from '../service';

import { HelperParameter } from '.';

export function SetupDefaultConfig<C extends ConfigTree>(defaultConfig: C) {
  return (target: any) => {
    if (!(target instanceof Service)) {
      throw new Error(`SetupConfig can only use at Service's child classes.`);
    }

    const toSetDefaultConfig = Reflect.hasMetadata('defaultConfig', target)
      ? { ...Reflect.getMetadata('defaultConfig', target), ...defaultConfig }
      : defaultConfig;
    Reflect.defineMetadata('defaultConfig', toSetDefaultConfig, target);
  };
}

export function ProvideConfig<C extends ConfigTree>(configs: (keyof C)[]) {
  return (
    target: any,
    methodName: string | symbol,
    descriptor: PropertyDescriptor,
  ): PropertyDescriptor => {
    if (!(target instanceof Service)) {
      throw new Error(
        `ProvideConfig can only use at Service's child classes.`,
      );
    }

    const originalMethod = descriptor.value;

    descriptor.value = async function _(
      params: HelperParameter<C>, ...args: unknown[]
    ) {
      if (!Reflect.hasMetadata('defaultConfig', target)) {
        throw new Error(
          'Method with ProvideConfig should use'
          + ' HelperParametr as first argument.',
        );
      }

      const defaultConfig = Reflect.getMetadata('defaultConfig', target);
      const tenantConfig: Record<string, any> = {};
      configs.forEach((each) => {
        const value = defaultConfig[each as string];
        if (isUndefined(value)) {
          return;
        }
        tenantConfig[each as string] = value;
      });
      return originalMethod.call(this, {
        ...params, configs: tenantConfig,
      }, ...args);
    };

    return descriptor;
  }
}
