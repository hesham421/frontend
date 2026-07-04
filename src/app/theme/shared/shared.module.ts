import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// project import
import { CardComponent } from './components/card/card.component';

// third party
import { NgScrollbarModule } from 'ngx-scrollbar';
import { IconDirective } from '@ant-design/icons-angular';
import { TranslateModule } from '@ngx-translate/core';
import { SafeAntIconPipe } from './pipes/safe-ant-icon.pipe';

// NOTE: ng-bootstrap (NgbDropdownModule/NgbNavModule/NgbTooltipModule/
// NgbModule/NgbAccordionModule/NgbCollapseModule/NgbDatepickerModule) was
// removed in Phase 3 — replaced by the CDK-Overlay-based AvlDropdown/
// AvlTabs/AvlTooltip/Dialog/Drawer primitives in src/app/shared/overlay/
// and src/app/shared/components/avl-tabs/. NgbAccordionModule,
// NgbCollapseModule, and NgbDatepickerModule had zero real usages anywhere
// in the app (confirmed via repo-wide search, design-system/
// NGB-USAGE-INVENTORY.md) — dead imports, removed without replacement.

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    NgScrollbarModule,
    FormsModule,
    ReactiveFormsModule,
    CardComponent,
    TranslateModule,
    IconDirective,
    SafeAntIconPipe
  ],
  exports: [
    CommonModule,
    NgScrollbarModule,
    FormsModule,
    ReactiveFormsModule,
    CardComponent,
    TranslateModule,
    IconDirective,
    SafeAntIconPipe
  ]
})
export class SharedModule {}

