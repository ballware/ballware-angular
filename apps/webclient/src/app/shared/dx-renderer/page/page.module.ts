import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { I18NextModule } from 'angular-i18next';

import { EditModule } from '../edit/edit.module';
import { PageLayoutItemComponent } from './layout/item.component';
import { PageComponent } from './page/page.component';
import { PageLayoutComponent } from './layout/layout.component';
import { ToolbarModule } from '../toolbar/toolbar.module';
import { PageLayoutCrudcontainerComponent } from './crudcontainer/crudcontainer.component';
import { PageLayoutEntitygridComponent } from './entitygrid/entitygrid.component';
import { PageLayoutGridComponent } from './grid/grid.component';
import { PageLayoutMapComponent } from './map/map.component';
import { PageLayoutTabsComponent } from './tabs/tabs.component';
import { PageLayoutTabsCounterComponent } from './tabs/counter.component';
import { DxLoadIndicatorModule, DxMapModule, DxTabPanelModule } from 'devextreme-angular';

@NgModule({
  declarations: [
    PageComponent,
    PageLayoutComponent,
    PageLayoutItemComponent,
    PageLayoutCrudcontainerComponent,
    PageLayoutEntitygridComponent,
    PageLayoutGridComponent,
    PageLayoutMapComponent,
    PageLayoutTabsComponent,
    PageLayoutTabsCounterComponent
  ],
  imports: [
    CommonModule,
    I18NextModule,
    ToolbarModule,
    EditModule,
    DxTabPanelModule,
    DxMapModule,
    DxLoadIndicatorModule
  ],
  exports: [
    PageComponent,
    PageLayoutItemComponent
  ]
})
export class PageModule {}
