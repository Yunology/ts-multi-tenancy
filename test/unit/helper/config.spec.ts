// test/unit/helper/config.spec.ts
import { expect } from 'chai';

import { SetupDefaultConfig } from 'helper';
import { ConfigTree } from 'index';

describe('Helper Config', () => {
  describe('Decorator SetupDefaultConfig', () => {
    it('Should raise error if class is not extended Service', async () => {
      interface NotExtendedServiceConfig extends ConfigTree {}

      class NotExtendedServiceClass {}

      expect(() =>
        SetupDefaultConfig<NotExtendedServiceConfig>({})(
          NotExtendedServiceClass,
        ),
      ).to.throw(
        `SetupDefaultConfig can only use at Service's child classes.`,
      );
    });
  });
});
