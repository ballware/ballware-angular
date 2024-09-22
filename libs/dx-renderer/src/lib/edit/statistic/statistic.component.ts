import { Component, Inject, OnDestroy, OnInit, Provider } from '@angular/core';
import { StatisticOptions } from '@ballware/meta-model';
import { LOOKUP_SERVICE, LookupService, META_SERVICE, MetaService, STATISTIC_SERVICE, STATISTIC_SERVICE_FACTORY, StatisticService, StatisticServiceFactory } from '@ballware/meta-services';
import { nanoid } from 'nanoid';
import { Observable, map, takeUntil } from 'rxjs';
import { CommonModule } from '@angular/common';
import { StatisticChartComponent } from '../../statistic/items/chart.component';
import { StatisticMapComponent } from '../../statistic/items/map.component';
import { StatisticPivotgridComponent } from '../../statistic/items/pivotgrid.component';
import { Destroy, EditItemLivecycle, Visible } from '@ballware/renderer-commons';

@Component({
  selector: 'ballware-edit-statistic',
  templateUrl: './statistic.component.html',
  styleUrls: ['./statistic.component.scss'],
  providers: [
    { 
      provide: STATISTIC_SERVICE, 
      useFactory: (serviceFactory: StatisticServiceFactory, lookupService: LookupService) => serviceFactory(lookupService),
      deps: [STATISTIC_SERVICE_FACTORY, LOOKUP_SERVICE]  
    } as Provider,
  ],
  imports: [CommonModule, StatisticChartComponent, StatisticMapComponent, StatisticPivotgridComponent],
  hostDirectives: [Destroy, { directive: EditItemLivecycle, inputs: ['initialLayoutItem'] }, Visible],
  standalone: true
})
export class EditLayoutStatisticComponent implements OnInit, OnDestroy {
  
  type$: Observable<'chart' | 'map' | 'pivot' | undefined>;

  constructor(
    @Inject(META_SERVICE) private metaService: MetaService,     
    @Inject(STATISTIC_SERVICE) private statisticService: StatisticService,
    public destroy: Destroy,
    public livecycle: EditItemLivecycle,
    public visible: Visible
  ) {
  
    this.type$ = this.statisticService.layout$.pipe(map((layout) => layout?.type));

    this.metaService.customParam$
        .pipe(takeUntil(this.destroy.destroy$))
        .subscribe((customParam) => {
          this.statisticService.setCustomParam(customParam);
        });    
  }

  ngOnInit(): void {    
    this.livecycle.preparedLayoutItem$
      .pipe(takeUntil(this.destroy.destroy$))
      .subscribe((layoutItem) => {
        if (layoutItem) {          
          let identifier = (layoutItem?.options?.itemoptions as StatisticOptions).identifier;

          if (!identifier) {
            identifier = nanoid(11);
          }
        
          if (identifier) {            
            this.statisticService.setIdentifier(identifier);
            this.statisticService.setHeadParams((layoutItem.options?.itemoptions as StatisticOptions).params ?? {});
            this.statisticService.setStatistic(identifier);
          }
        }          
      });
  }

  ngOnDestroy(): void {
    this.statisticService.ngOnDestroy();
  }
}
