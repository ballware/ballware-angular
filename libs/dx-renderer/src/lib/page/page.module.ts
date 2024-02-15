import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { I18NextModule } from 'angular-i18next';

import { DxDeferRenderingModule, DxHtmlEditorModule, DxLoadIndicatorModule, DxMapModule, DxPopupModule, DxTabPanelModule } from 'devextreme-angular';
import { DatacontainerModule } from '../datacontainer/datacontainer.module';
import { EditModule } from '../edit/edit.module';
import { StatisticModule } from '../statistic/statistic.module';
import { ToolbarModule } from '../toolbar/toolbar.module';
import { PageLayoutCrudcontainerComponent } from './crudcontainer/crudcontainer.component';
import { PageLayoutEntitygridComponent } from './entitygrid/entitygrid.component';
import { PageLayoutGridComponent } from './grid/grid.component';
import { PageLayoutItemComponent } from './layout/item.component';
import { PageLayoutComponent } from './layout/layout.component';
import { PageLayoutMapComponent } from './map/map.component';
import { PageComponent } from './page/page.component';
import { PageLayoutStatisticComponent } from './statistic/statistic.component';
import { PageLayoutTabsCounterComponent } from './tabs/counter.component';
import { PageLayoutTabsComponent } from './tabs/tabs.component';

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
    PageLayoutTabsCounterComponent,
    PageLayoutStatisticComponent
  ],
  imports: [
    CommonModule,
    I18NextModule,
    ToolbarModule,
    DatacontainerModule,
    EditModule,
    StatisticModule,
    DxTabPanelModule,
    DxMapModule,
    DxLoadIndicatorModule,
    DxDeferRenderingModule,
    DxPopupModule,
    DxHtmlEditorModule
  ],
  exports: [
    PageComponent,
    PageLayoutComponent,
    PageLayoutItemComponent
  ]
})
export class PageModule {}
