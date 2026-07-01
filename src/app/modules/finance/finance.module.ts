import { NgModule } from '@angular/core';

import { FinanceRoutingModule } from './finance-routing.module';
import { GlFacade } from './gl/facades/gl.facade';

@NgModule({
  imports: [FinanceRoutingModule],
  providers: [GlFacade]
})
export class FinanceModule {}
