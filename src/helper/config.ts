// src/helper/config.ts
import { RuntimeTenant } from '../runtime';
import { Service } from '../service';

export type ConfigTree = Record<symbol, any>;

export function SetupDefaultConfig<C extends ConfigTree>(
  defaultConfig: C,
): ClassDecorator {
  return (target: any) => {
    if (!(new target() instanceof Service)) {
      throw new Error(
        `SetupDefaultConfig can only use at Service's child classes.`,
      );
    }

    const toSetDefaultConfig = Reflect.hasMetadata('defaultConfig', target)
      ? { ...Reflect.getMetadata('defaultConfig', target), ...defaultConfig }
      : defaultConfig;
    Reflect.defineMetadata('defaultConfig', toSetDefaultConfig, target);
  };
}

export function extractRuntimeTenantConfig<C extends ConfigTree>(
  serviceConstructor: Function,
  rt: RuntimeTenant,
): C {
  const configs: Record<string | symbol, any> = {};
  const defaultConfigs = (Reflect.getMetadata(
    'defaultConfig',
    serviceConstructor,
  ) || {}) as Record<string | symbol, any>;
  Object.keys(defaultConfigs).forEach((key) => {
    const defaultConfig = defaultConfigs[key];
    configs[key] = rt.getConfig<typeof defaultConfig>(key, defaultConfig);
  });
  Object.keys(rt.getConfigMap).forEach((key) => {
    configs[key] = rt.getConfig(key);
  });
  return configs as C;
}
