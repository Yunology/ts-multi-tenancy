// test/a_module.ts
import { RuntimeTenant } from 'runtime';
import { Service } from 'service';

export class AService extends Service {
  public initDate!: Date;

  async setupByTenant(rt: RuntimeTenant): Promise<AService> {
    await super.setupByTenant(rt);
    this.initDate = new Date();
    await new Promise((resolve) => {
      setTimeout(resolve, 1000);
    });

    return this;
  }
}
