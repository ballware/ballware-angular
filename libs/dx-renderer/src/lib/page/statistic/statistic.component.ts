import { Component, Input, OnInit, Provider } from "@angular/core";
import { PageLayoutItem, StatisticOptions } from "@ballware/meta-model";
import { LOOKUP_SERVICE, LookupService, PageService, ServiceFactory, StatisticService } from "@ballware/meta-services";
import { nanoid } from "nanoid";
import { Observable, map, takeUntil } from "rxjs";
import { WithDestroy } from "../../utils/withdestroy";

@Component({
    selector: 'ballware-page-statistic',
    templateUrl: './statistic.component.html',
    styleUrls: ['./statistic.component.scss'],
    providers: [
      { 
        provide: StatisticService, 
        useFactory: (serviceFactory: ServiceFactory, lookupService: LookupService) => serviceFactory.createStatisticService(lookupService),
        deps: [ServiceFactory, LOOKUP_SERVICE]  
      } as Provider,
    ]
  })
  export class PageLayoutStatisticComponent extends WithDestroy() implements OnInit { 

    @Input() layoutItem!: PageLayoutItem;

    type$: Observable<'chart' | 'map' | 'pivot' | undefined>;
    
    constructor(private pageService: PageService, private statisticService: StatisticService) {
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