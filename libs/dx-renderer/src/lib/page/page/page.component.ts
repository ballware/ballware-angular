import { Component, HostBinding, Inject, Input, OnChanges, OnDestroy, OnInit, Provider, SimpleChanges } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LOOKUP_SERVICE, LOOKUP_SERVICE_FACTORY, LookupService, LookupServiceFactory, PageService, ResponsiveService, SCREEN_SIZE, ServiceFactory } from '@ballware/meta-services';
import { Observable, map, takeUntil } from 'rxjs';
import { WithDestroy } from '../../utils/withdestroy';

@Component({
  selector: 'ballware-page',
  templateUrl: './page.component.html',
  styleUrls: ['./page.component.scss'],
  providers: [    
    { 
      provide: LOOKUP_SERVICE, 
      useFactory: (serviceFactory: LookupServiceFactory) => serviceFactory(),
      deps: [LOOKUP_SERVICE_FACTORY]  
    } as Provider,
    { 
      provide: PageService, 
      useFactory: (serviceFactory: ServiceFactory, router: Router, lookupService: LookupService) => serviceFactory.createPageService(router, lookupService),
      deps: [ServiceFactory, Router, LOOKUP_SERVICE]  
    } as Provider
  ]
})
export class PageComponent extends WithDestroy() implements OnDestroy, OnChanges {  
  @HostBinding('class') classes = 'h-100 p-2';

  public readonly initialized$ = this.pageService.initialized$;

  public fullscreenDialogs$: Observable<boolean>;

  @Input() id!: string;
  @Input() page!: string; 

  constructor(private responsiveService: ResponsiveService, private pageService: PageService, @Inject(LOOKUP_SERVICE) private lookupService: LookupService) {
    super();

    this.fullscreenDialogs$ = this.responsiveService.onResize$
      .pipe(takeUntil(this.destroy$))
      .pipe(map((screenSize) => screenSize <= SCREEN_SIZE.SM));
  }
  
  override ngOnDestroy(): void {
    super.ngOnDestroy();
    
    this.pageService.ngOnDestroy();
    this.lookupService.ngOnDestroy();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['id']) {
      this.pageService.setPageUrl(changes['id'].currentValue);
    }

    if (changes['page']) {
      this.pageService.setPageQuery(changes['page'].currentValue);
    }
  }
  
}
