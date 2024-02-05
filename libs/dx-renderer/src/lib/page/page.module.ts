import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { I18NextModule } from 'angular-i18next';

import { DxChartModule, DxDeferRenderingModule, DxLoadIndicatorModule, DxMapModule, DxPivotGridModule, DxTabPanelModule } from 'devextreme-angular';
import { EditModule } from '../edit/edit.module';
import { ToolbarModule } from '../toolbar/toolbar.module';
import { PageLayoutCrudcontainerComponent } from './crudcontainer/crudcontainer.component';
import { PageLayoutEntitygridComponent } from './entitygrid/entitygrid.component';
import { PageLayoutGridComponent } from './grid/grid.component';
import { PageLayoutItemComponent } from './layout/item.component';
import { PageLayoutComponent } from './layout/layout.component';
import { PageLayoutMapComponent } from './map/map.component';
import { PageComponent } from './page/page.component';
import { StatisticChartComponent } from './statistic/chart.component';
import { StatisticMapComponent } from './statistic/map.component';
import { StatisticPivotgridComponent } from './statistic/pivotgrid.component';
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
    PageLayoutStatisticComponent,
    StatisticPivotgridComponent,
    StatisticChartComponent,
    StatisticMapComponent
  ],
  imports: [
    CommonModule,
    I18NextModule,
    ToolbarModule,
    EditModule,
    DxTabPanelModule,
    DxMapModule,
    DxLoadIndicatorModule,
    DxDeferRenderingModule,
    DxChartModule,
    DxPivotGridModule
  ],
  exports: [
    PageComponent,
    PageLayoutComponent,
    PageLayoutItemComponent
  ]
})
export class PageModule {}
