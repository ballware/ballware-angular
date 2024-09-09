import { Component, Inject, Input, OnDestroy, OnInit, Provider } from '@angular/core';
import { EditLayoutItem, StatisticOptions } from '@ballware/meta-model';
import { EDIT_SERVICE, EditService, LOOKUP_SERVICE, LookupService, META_SERVICE, MetaService, STATISTIC_SERVICE, STATISTIC_SERVICE_FACTORY, StatisticService, StatisticServiceFactory } from '@ballware/meta-services';
import { nanoid } from 'nanoid';
import { Observable, map, takeUntil } from 'rxjs';
import { WithDestroy } from '../../utils/withdestroy';
import { WithEditItemLifecycle } from '../../utils/withedititemlivecycle';
import { WithVisible } from '../../utils/withvisible';
import { CommonModule } from '@angular/common';
import { StatisticChartComponent } from '../../statistic/items/chart.component';
import { StatisticMapComponent } from '../../statistic/items/map.component';
import { StatisticPivotgridComponent } from '../../statistic/items/pivotgrid.component';

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
  standalone: true
})
export class EditLayoutStatisticComponent extends WithVisible(WithEditItemLifecycle(WithDestroy())) implements OnInit, OnDestroy {
  
  @Input() initialLayoutItem?: EditLayoutItem;

  public layoutItem: EditLayoutItem|undefined;

  type$: Observable<'chart' | 'map' | 'pivot' | undefined>;

  constructor(
    @Inject(META_SERVICE) private metaService: MetaService, 
    @Inject(EDIT_SERVICE) private editService: EditService, 
    @Inject(STATISTIC_SERVICE) private statisticService: StatisticService) {
      
    super();    

    this.type$ = this.statisticService.layout$.pipe(map((layout) => layout?.type));

    this.metaService.customParam$
        .pipe(takeUntil(this.destroy$))
        .subscribe((customParam) => {
          this.statisticService.setCustomParam(customParam);
        });    
  }

  ngOnInit(): void {
    
    let identifier = (this.layoutItem?.options?.itemoptions as StatisticOptions)?.identifier;

    if (!identifier) {
      identifier = nanoid(11);
    }

    if (identifier) {
      this.statisticService.setIdentifier(identifier);
    }

    if (this.initialLayoutItem) {
      this.initLifecycle(this.initialLayoutItem, this.editService, this);

      this.preparedLayoutItem$
        .pipe(takeUntil(this.destroy$))
        .subscribe((layoutItem) => {
          if (layoutItem) {
            this.initVisible(layoutItem); 

            const statisticIdentifier = (layoutItem?.options?.itemoptions as StatisticOptions).identifier;
          
            if (statisticIdentifier) {            
              this.statisticService.setHeadParams((layoutItem.options?.itemoptions as StatisticOptions).params ?? {});
              this.statisticService.setStatistic(statisticIdentifier);
            }
          }          
        });
    }
  }

  override ngOnDestroy(): void {
    super.ngOnDestroy();

    this.statisticService.ngOnDestroy();
  }
}
