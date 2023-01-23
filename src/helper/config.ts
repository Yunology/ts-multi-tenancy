// src/helper/config.ts
import { ConfigTree, Service } from '../service';

export function SetupDefaultConfig<C extends ConfigTree>(
  defaultConfig: C,
): ClassDecorator {
  return (target: any) => {
    if (!(new target() instanceof Service)) {
      throw new Error(`SetupDefaultConfig can only use at Service's child classes.`);
    }

    const toSetDefaultConfig = Reflect.hasMetadata('defaultConfig', target)
      ? { ...Reflect.getMetadata('defaultConfig', target), ...defaultConfig }
      : defaultConfig;
    Reflect.defineMetadata('defaultConfig', toSetDefaultConfig, target);
  };
}
