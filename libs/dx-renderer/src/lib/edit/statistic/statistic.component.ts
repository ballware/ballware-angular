import { Component, Input, OnDestroy, OnInit, Provider } from '@angular/core';
import { EditLayoutItem, StatisticOptions } from '@ballware/meta-model';
import { EditItemRef, EditService, LookupService, MetaService, MetaServiceFactory, StatisticService } from '@ballware/meta-services';
import { nanoid } from 'nanoid';
import { Observable, map, takeUntil } from 'rxjs';
import { WithDestroy } from '../../utils/withdestroy';
import { WithEditItemLifecycle } from '../../utils/withedititemlivecycle';

@Component({
  selector: 'ballware-edit-statistic',
  templateUrl: './statistic.component.html',
  styleUrls: ['./statistic.component.scss'],
  providers: [
    { 
      provide: StatisticService, 
      useFactory: (serviceFactory: MetaServiceFactory, lookupService: LookupService) => serviceFactory.createStatisticService(lookupService),
      deps: [MetaServiceFactory, LookupService]  
    } as Provider,
  ]
})
export class EditLayoutStatisticComponent extends WithEditItemLifecycle(WithDestroy()) implements OnInit, OnDestroy, EditItemRef {

  @Input() initialLayoutItem?: EditLayoutItem;

  public layoutItem: EditLayoutItem|undefined;

  type$: Observable<'chart' | 'map' | 'pivot' | undefined>;

  constructor(private metaService: MetaService, private editService: EditService, private statisticService: StatisticService) {
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

          const statisticIdentifier = (layoutItem?.options?.itemoptions as StatisticOptions).identifier;

          if (layoutItem && statisticIdentifier) {            
            this.statisticService.setHeadParams((layoutItem.options?.itemoptions as StatisticOptions).params ?? {});
            this.statisticService.setStatistic(statisticIdentifier);
          }
        });
    }
  }

  override ngOnDestroy(): void {
    super.ngOnDestroy();

    this.statisticService.ngOnDestroy();
  }
  
  public getOption(option: string): any {
    throw new Error("Method not implemented.");
  }

  public setOption(option: string, value: unknown) {
    throw new Error("Method not implemented.");
  }

}
