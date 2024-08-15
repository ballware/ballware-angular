import { Component, EventEmitter, Inject, Input, OnInit, Output, Provider } from '@angular/core';
import { ApiError } from '@ballware/meta-api';
import { LOOKUP_SERVICE, LOOKUP_SERVICE_FACTORY, LookupService, LookupServiceFactory, META_SERVICE, META_SERVICE_FACTORY, MetaService, MetaServiceFactory, PAGE_SERVICE, PageService } from '@ballware/meta-services';
import { catchError, combineLatest, of, switchMap, takeUntil } from 'rxjs';
import { WithDestroy } from '../../utils/withdestroy';

@Component({
  selector: 'ballware-page-tabs-counter',
  templateUrl: './counter.component.html',
  styleUrls: ['./counter.component.scss'],
  providers: [
    { 
      provide: LOOKUP_SERVICE, 
      useFactory: (serviceFactory: LookupServiceFactory) => serviceFactory(),
      deps: [LOOKUP_SERVICE_FACTORY]  
    } as Provider,
    { 
      provide: META_SERVICE, 
      useFactory: (serviceFactory: MetaServiceFactory, lookupService: LookupService) => serviceFactory(lookupService),
      deps: [META_SERVICE_FACTORY, LOOKUP_SERVICE]
    } as Provider,
  ]
})
export class PageLayoutTabsCounterComponent extends WithDestroy() implements OnInit {

  @Input() tab!: any;
  @Input() caption!: string;
  @Input() entity!: string;
  @Input() query!: string;

  @Output() tabNotAuthorized = new EventEmitter<{ tab: any }>();

  public count: number|undefined = undefined;

  constructor(
    @Inject(PAGE_SERVICE) private pageService: PageService, 
    @Inject(META_SERVICE) private metaService: MetaService) {
    super();

    this.pageService.customParam$
      .pipe(takeUntil(this.destroy$))
      .subscribe((customParam) => {
        this.metaService.setInitialCustomParam(customParam);
      });

    this.pageService.headParams$
      .pipe(takeUntil(this.destroy$))
      .subscribe((pageParam) => {
        if (pageParam) {
          this.metaService.setHeadParams(pageParam);
        }
      });

    combineLatest([this.metaService.count$, this.pageService.headParams$])
      .pipe(takeUntil(this.destroy$))
      .pipe(switchMap(([countFunc, pageParam]) => (countFunc && pageParam)
        ? countFunc(this.query ?? 'primary', pageParam)
          .pipe(catchError((error: ApiError) => {      
            if (error.status === 401) {              
              this.tabNotAuthorized.emit({ tab: this.tab });

              return of(0);              
            }             
            
            throw error;
          }))
        : of(undefined)))
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
