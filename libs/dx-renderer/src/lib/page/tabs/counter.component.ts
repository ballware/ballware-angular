import {
  Component,
  DestroyRef,
  EventEmitter,
  Inject,
  Input,
  OnInit,
  Output,
  Provider,
} from '@angular/core';
import { ApiError } from '@ballware/meta-api';
import { LOOKUP_SERVICE, LOOKUP_SERVICE_FACTORY, LookupService, LookupServiceFactory, META_SERVICE, META_SERVICE_FACTORY, MetaService, MetaServiceFactory, PAGE_SERVICE, PageService } from '@ballware/meta-services';
import { catchError, combineLatest, of, switchMap } from 'rxjs';
import { DxLoadIndicatorModule } from 'devextreme-angular';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'ballware-page-tabs-counter',
  templateUrl: './counter.component.html',
  styleUrls: ['./counter.component.scss'],
  providers: [
    {
      provide: LOOKUP_SERVICE,
      useFactory: (serviceFactory: LookupServiceFactory) => serviceFactory(),
      deps: [LOOKUP_SERVICE_FACTORY],
    } as Provider,
    {
      provide: META_SERVICE,
      useFactory: (
        serviceFactory: MetaServiceFactory,
        lookupService: LookupService
      ) => serviceFactory(lookupService),
      deps: [META_SERVICE_FACTORY, LOOKUP_SERVICE],
    } as Provider,
  ],
  imports: [CommonModule, DxLoadIndicatorModule],
  standalone: true,
})
export class PageLayoutTabsCounterComponent implements OnInit {
  @Input() tab!: any;
  @Input() caption!: string;
  @Input() entity!: string;
  @Input() query!: string;

  @Output() tabNotAuthorized = new EventEmitter<{ tab: any }>();

  public count: number | undefined = undefined;

  constructor(
    private destroy: DestroyRef,
    @Inject(PAGE_SERVICE) private pageService: PageService,
    @Inject(META_SERVICE) private metaService: MetaService
  ) {
    this.pageService.customParam$
      .pipe(takeUntilDestroyed(this.destroy))
      .subscribe((customParam) => {
        this.metaService.setInitialCustomParam(customParam);
      });

    this.pageService.headParams$
      .pipe(takeUntilDestroyed(this.destroy))
      .subscribe((pageParam) => {
        if (pageParam) {
          this.metaService.setHeadParams(pageParam);
        }
      });

    combineLatest([this.metaService.count$, this.pageService.headParams$])
      .pipe(
        takeUntilDestroyed(this.destroy),
        switchMap(([countFunc, pageParam]) =>
          countFunc && pageParam
            ? countFunc(this.query ?? 'primary', pageParam).pipe(
                catchError((error: ApiError) => {
                  if (error.status === 401) {
                    this.tabNotAuthorized.emit({ tab: this.tab });

                    return of(0);
                  }

                  throw error;
                })
              )
            : of(undefined)
        )
      )
      .subscribe((count) => {
        this.count = count;
      });
  }

  ngOnInit(): void {
    if (this.entity) {
      this.metaService.setEntity(this.entity);
      this.metaService.setReadOnly(true);
    }
  }
}
