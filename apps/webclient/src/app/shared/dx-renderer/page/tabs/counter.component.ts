import { Component, Input, OnInit, Provider } from '@angular/core';
import { PageService, LookupService, MetaService, DefaultMetaService, DefaultLookupService } from '@ballware/meta-services';
import { combineLatest, Observable, of, switchMap, takeUntil } from 'rxjs';
import { WithDestroy } from '../../utils/withdestroy';

@Component({
  selector: 'ballware-page-tabs-counter',
  templateUrl: './counter.component.html',
  styleUrls: ['./counter.component.scss'],
  providers: [
    { provide: LookupService, useClass: DefaultLookupService } as Provider,
    { provide: MetaService, useClass: DefaultMetaService } as Provider,
  ]
})
export class PageLayoutTabsCounterComponent extends WithDestroy() implements OnInit {

  @Input() entity?: string;
  @Input() query?: string;

  public count$: Observable<number|undefined>;

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

    this.count$ = combineLatest([this.metaService.count$, this.pageService.headParams$])
      .pipe(takeUntil(this.destroy$))
      .pipe(switchMap(([countFunc, pageParam]) => (countFunc && pageParam)
        ? countFunc(this.query ?? 'primary', pageParam)
        : of(undefined)));
  }

  ngOnInit(): void {
    if (this.entity) {
      this.metaService.setEntity(this.entity);
      this.metaService.setReadonly(true);
    }
  }
}
