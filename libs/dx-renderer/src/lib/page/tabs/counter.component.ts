import { Component, Input, OnInit, Provider } from '@angular/core';
import { LookupService, MetaService, MetaServiceFactory, PageService } from '@ballware/meta-services';
import { combineLatest, of, switchMap, takeUntil } from 'rxjs';
import { WithDestroy } from '../../utils/withdestroy';

@Component({
  selector: 'ballware-page-tabs-counter',
  templateUrl: './counter.component.html',
  styleUrls: ['./counter.component.scss'],
  providers: [
    { 
      provide: LookupService, 
      useFactory: (serviceFactory: MetaServiceFactory) => serviceFactory.createLookupService(),
      deps: [MetaServiceFactory]  
    } as Provider,
    { 
      provide: MetaService, 
      useFactory: (serviceFactory: MetaServiceFactory, lookupService: LookupService) => serviceFactory.createMetaService(lookupService),
      deps: [MetaServiceFactory, LookupService]
    } as Provider,
  ]
})
export class PageLayoutTabsCounterComponent extends WithDestroy() implements OnInit {

  @Input() caption?: string;
  @Input() entity?: string;
  @Input() query?: string;

  public count: number|undefined = undefined;

  constructor(private pageService: PageService, private metaService: MetaService) {
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
