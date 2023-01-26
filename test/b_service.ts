// test/b_service.ts
import { RuntimeTenant } from 'runtime';
import { Service } from 'service';

export class BService extends Service {
  public initDate!: Date;

  async setupByTenant(rt: RuntimeTenant): Promise<BService> {
    await super.setupByTenant(rt);
    this.initDate = new Date();
    return this;
  }
}
