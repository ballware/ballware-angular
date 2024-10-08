import { Component, Inject, Input, OnInit, Provider } from "@angular/core";
import { PageLayoutItem, StatisticOptions } from "@ballware/meta-model";
import { LOOKUP_SERVICE, LookupService, PAGE_SERVICE, PageService, STATISTIC_SERVICE, STATISTIC_SERVICE_FACTORY, StatisticService, StatisticServiceFactory } from "@ballware/meta-services";
import { nanoid } from "nanoid";
import { Observable, map, takeUntil } from "rxjs";
import { WithDestroy } from "../../utils/withdestroy";
import { StatisticChartComponent, StatisticMapComponent, StatisticPivotgridComponent } from "../../statistic";
import { CommonModule } from "@angular/common";

@Component({
    selector: 'ballware-page-statistic',
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
  export class PageLayoutStatisticComponent extends WithDestroy() implements OnInit { 
    
    @Input() layoutItem!: PageLayoutItem;

    type$: Observable<'chart' | 'map' | 'pivot' | undefined>;
    
    constructor(
      @Inject(PAGE_SERVICE) private pageService: PageService, 
      @Inject(STATISTIC_SERVICE) private statisticService: StatisticService) {
      super();

      this.type$ = this.statisticService.layout$.pipe(map((layout) => layout?.type));
      
      this.pageService.customParam$
        .pipe(takeUntil(this.destroy$))
        .subscribe((customParam) => {
          this.statisticService.setCustomParam(customParam);
        });    
    
      this.pageService.headParams$
        .pipe(takeUntil(this.destroy$))
        .subscribe((headParams) => {
            if (headParams) {
              this.statisticService.setHeadParams(headParams);
            }
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

    if (this.layoutItem.options?.itemoptions) {
      this.statisticService.setStatistic((this.layoutItem.options.itemoptions as StatisticOptions).statistic);
    }
  } 
}  