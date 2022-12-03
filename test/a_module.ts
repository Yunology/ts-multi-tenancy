// test/a_module.ts
import { Service } from 'service';

export class AModule extends Service {
  clone(): AModule {
    return new AModule();
  }
}
