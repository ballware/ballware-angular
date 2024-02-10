import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { I18NextModule } from 'angular-i18next';
import { DxChartModule, DxMapModule, DxPivotGridModule } from 'devextreme-angular';
import { StatisticChartComponent } from './items/chart.component';
import { StatisticMapComponent } from './items/map.component';
import { StatisticPivotgridComponent } from './items/pivotgrid.component';

@NgModule({
  declarations: [
    StatisticPivotgridComponent,
    StatisticChartComponent,
    StatisticMapComponent
  ],
  imports: [
    CommonModule,
    I18NextModule,
    DxMapModule,
    DxChartModule,
    DxPivotGridModule,
  ],
  exports: [
    StatisticPivotgridComponent,
    StatisticChartComponent,
    StatisticMapComponent
  ]
})
export class StatisticModule {}
