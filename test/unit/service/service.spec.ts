// test/unit/service/service.spec.ts
import { expect } from 'chai';
import { ConfigTree, RuntimeTenant, Service, SetupDefaultConfig, TenantPlanInfo } from 'index';

describe('Service class', () => {
  describe('Method config', () => {
    it('Default config', async () => {
      interface DefaultConfig extends ConfigTree {
        num: number;
      }

      @SetupDefaultConfig<DefaultConfig>({ num: 1 })
      class DefaultConfigClass extends Service {}

      const rt = new RuntimeTenant(
        'id-test',
        'name',
        'orgName',
        true,
        { database: '' },
        new TenantPlanInfo('name', [], [], []),
        {},
      );

      const instance = new DefaultConfigClass();
      await instance.init(rt);
      expect(instance.config<DefaultConfig>(
        instance.getTenant,
      ).num).to.be.eq(1);
    });

    it('Default config and overwrite with RuntimeTenant config', async () => {
      interface OverwriteDefaultConfig extends ConfigTree {
        num: number;
      }

      @SetupDefaultConfig<OverwriteDefaultConfig>({ num: 1 })
      class OverwriteDefaultConfigClass extends Service {}

      const rt = new RuntimeTenant(
        'id-test',
        'name',
        'orgName',
        true,
        { database: '', num: 8 },
        new TenantPlanInfo('name', [], [], []),
        {},
      );

      const instance = new OverwriteDefaultConfigClass();
      await instance.init(rt);
      expect(instance.config<OverwriteDefaultConfig>(
        instance.getTenant,
      ).num).to.be.eq(8);
    });

    it('Setup multiple default configs', async () => {
      interface DefaultConfigOne extends ConfigTree {
        foo: number;
      }
      interface DefaultConfigTwo extends ConfigTree {
        bar: string;
      }

      @SetupDefaultConfig<DefaultConfigOne>({ foo: 1 })
      @SetupDefaultConfig<DefaultConfigTwo>({ bar: 'a' })
      class MultipleDefaultConfigClass extends Service {}

      const rt = new RuntimeTenant(
        'id-test',
        'name',
        'orgName',
        true,
        { database: '' },
        new TenantPlanInfo('name', [], [], []),
        {},
      );

      const instance = new MultipleDefaultConfigClass();
      await instance.init(rt);
      expect(instance.config<DefaultConfigOne>(
        instance.getTenant,
      ).foo).to.be.eq(1);
      expect(instance.config<DefaultConfigTwo>(
        instance.getTenant,
      ).bar).to.be.eq('a');
    });

    it('Empty default config and load RuntimeTenant config', async () => {
      interface SomePredefineConfig extends ConfigTree {
        bar: number;
      }

      class EmptyDefaultConfigClass extends Service{}

      const rt = new RuntimeTenant(
        'id-test',
        'name',
        'orgName',
        true,
        { database: '', bar: 123 },
        new TenantPlanInfo('name', [], [], []),
        {},
      );

      const instance = new EmptyDefaultConfigClass();
      await instance.init(rt);
      expect(instance.config<SomePredefineConfig>(
        instance.getTenant,
      ).bar).to.be.eq(123);
    });
  });
});
