import { Component, HostBinding, OnDestroy, Provider } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ResponsiveService } from '@ballware/common-services';
import { LookupService, MetaServiceFactory, PageService } from '@ballware/meta-services';
import { Observable, takeUntil } from 'rxjs';
import { WithDestroy } from '../../utils/withdestroy';

@Component({
  selector: 'ballware-page',
  templateUrl: './page.component.html',
  styleUrls: ['./page.component.scss'],
  providers: [    
    { 
      provide: LookupService, 
      useFactory: (serviceFactory: MetaServiceFactory) => serviceFactory.createLookupService(),
      deps: [MetaServiceFactory]  
    } as Provider,
    { 
      provide: PageService, 
      useFactory: (serviceFactory: MetaServiceFactory, activatedRoute: ActivatedRoute, router: Router, lookupService: LookupService) => serviceFactory.createPageService(activatedRoute, router, lookupService),
      deps: [MetaServiceFactory, ActivatedRoute, Router, LookupService]  
    } as Provider
  ]
})
export class PageComponent extends WithDestroy() implements OnDestroy {  
  @HostBinding('class') classes = 'h-100 p-2';

  public readonly initialized$ = this.pageService.initialized$;

  public fullscreenDialogs$: Observable<boolean>;

  constructor(private responsiveService: ResponsiveService, private pageService: PageService, private lookupService: LookupService) {
    super();

    this.fullscreenDialogs$ = this.responsiveService.small$
      .pipe(takeUntil(this.destroy$));
  }

  override ngOnDestroy(): void {
    super.ngOnDestroy();
    
    this.pageService.ngOnDestroy();
    this.lookupService.ngOnDestroy();
  }
}
