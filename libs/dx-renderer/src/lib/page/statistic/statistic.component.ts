import {
  Component,
  DestroyRef,
  Inject,
  Input,
  OnInit,
  Provider,
} from '@angular/core';
import { PageLayoutItem, StatisticOptions } from "@ballware/meta-model";
import { LOOKUP_SERVICE, LookupService, PAGE_SERVICE, PageService, STATISTIC_SERVICE, STATISTIC_SERVICE_FACTORY, StatisticService, StatisticServiceFactory } from "@ballware/meta-services";
import { Observable, map } from "rxjs";
import { StatisticChartComponent, StatisticMapComponent, StatisticPivotgridComponent } from "../../statistic";
import { CommonModule } from "@angular/common";
import { Breadcrumb } from '@ballware/renderer-commons';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'ballware-page-statistic',
  templateUrl: './statistic.component.html',
  styleUrls: ['./statistic.component.scss'],
  providers: [
    {
      provide: STATISTIC_SERVICE,
      useFactory: (
        serviceFactory: StatisticServiceFactory,
        lookupService: LookupService
      ) => serviceFactory(lookupService),
      deps: [STATISTIC_SERVICE_FACTORY, LOOKUP_SERVICE],
    } as Provider,
  ],
  imports: [
    CommonModule,
    StatisticChartComponent,
    StatisticMapComponent,
    StatisticPivotgridComponent,
  ],
  hostDirectives: [Breadcrumb],
  standalone: true,
})
export class PageLayoutStatisticComponent implements OnInit
{
  @Input() layoutItem!: PageLayoutItem;

  type$: Observable<'chart' | 'map' | 'pivot' | undefined>;

  constructor(
    @Inject(PAGE_SERVICE) private pageService: PageService,
    @Inject(STATISTIC_SERVICE) private statisticService: StatisticService,
    private breadcrumb: Breadcrumb,
    private destroy: DestroyRef,
  ) {
    this.type$ = this.statisticService.layout$.pipe(
      map((layout) => layout?.type)
    );

    this.pageService.customParam$.pipe(
      takeUntilDestroyed(this.destroy)
    ).subscribe((customParam) => {
      this.statisticService.setCustomParam(customParam);
    });

    this.pageService.headParams$.pipe(
      takeUntilDestroyed(this.destroy)
    ).subscribe((headParams) => {
      if (headParams) {
        this.statisticService.setHeadParams(headParams);
      }
    });
  }

  ngOnInit(): void {
    const statisticOptions = this.layoutItem.options
      ?.itemoptions as StatisticOptions;

    if (statisticOptions?.statistic) {
      this.breadcrumb.setIdentifier(statisticOptions?.statistic);
      this.statisticService.setIdentifier(this.breadcrumb.pathString);

      this.statisticService.setStatistic(statisticOptions?.statistic);
    }
  }
}
