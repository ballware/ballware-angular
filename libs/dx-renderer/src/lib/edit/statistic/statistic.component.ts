import {
  Component,
  DestroyRef,
  Inject,
  OnDestroy,
  OnInit,
  Provider,
} from '@angular/core';
import { StatisticOptions } from '@ballware/meta-model';
import { LOOKUP_SERVICE, LookupService, META_SERVICE, MetaService, STATISTIC_SERVICE, STATISTIC_SERVICE_FACTORY, StatisticService, StatisticServiceFactory } from '@ballware/meta-services';
import { Observable, map } from 'rxjs';
import { CommonModule } from '@angular/common';
import { StatisticChartComponent } from '../../statistic';
import { StatisticMapComponent } from '../../statistic';
import { StatisticPivotgridComponent } from '../../statistic';
import {
  Breadcrumb,
  EditItemLivecycle,
  Visible,
} from '@ballware/renderer-commons';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

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
  hostDirectives: [Breadcrumb, { directive: EditItemLivecycle, inputs: ['initialLayoutItem'] }, Visible],
  standalone: true
})
export class EditLayoutStatisticComponent implements OnInit, OnDestroy {

  type$: Observable<'chart' | 'map' | 'pivot' | undefined>;

  constructor(
    @Inject(META_SERVICE) private metaService: MetaService,
    @Inject(STATISTIC_SERVICE) private statisticService: StatisticService,
    private breadcrumb: Breadcrumb,
    private destroy: DestroyRef,
    public livecycle: EditItemLivecycle,
    public visible: Visible
  ) {

    this.type$ = this.statisticService.layout$.pipe(map((layout) => layout?.type));

    this.metaService.customParam$.pipe(
      takeUntilDestroyed(this.destroy)
    ).subscribe((customParam) => {
      this.statisticService.setCustomParam(customParam);
    });
  }

  ngOnInit(): void {
    this.livecycle.preparedLayoutItem$.pipe(
      takeUntilDestroyed(this.destroy)
    ).subscribe((layoutItem) => {
      if (layoutItem) {
        const identifier = (layoutItem?.options?.itemoptions as StatisticOptions).identifier;

        if (identifier) {
          this.breadcrumb.setIdentifier(identifier);
          this.statisticService.setIdentifier(this.breadcrumb.pathString);
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
