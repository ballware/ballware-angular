import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { I18NextModule } from 'angular-i18next';

import { EditModule } from '../edit/edit.module';
import { PageLayoutItemComponent } from './layout/item.component';
import { PageComponent } from './page/page.component';
import { PageLayoutComponent } from './layout/layout.component';
import { ToolbarModule } from '../toolbar/toolbar.module';

@NgModule({
  declarations: [
    PageComponent,
    PageLayoutComponent,
    PageLayoutItemComponent
  ],
  imports: [
    CommonModule,
    I18NextModule,
    ToolbarModule,
    EditModule,
  ],
  exports: [
    PageComponent,
    PageLayoutItemComponent
  ]
})
export class PageModule {}
